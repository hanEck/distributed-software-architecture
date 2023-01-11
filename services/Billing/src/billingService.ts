import { Bill, GuestBill, GuestOrders, ItemRegistration, Menu, PaidBill, PAYMENT_METHOD } from "./types/types";
import { RabbitMQ } from "./rabbitmq";

const MAX_RETRY_COUNT = 5;

export default class BillingService {
	deliveryIds: number[] = [];
	bills: Bill[] = [];
	guestOrders: GuestOrders[] = [];
	menu: Menu;
	billIdCounter = 1;
	rabbitmq: RabbitMQ;

	constructor() {
		this.rabbitmq = new RabbitMQ();
		( async () => {
			await this.subscribeToMenu();
			await this.subscribeToDeliveries();
		} )();
	}

	private async subscribeToMenu(): Promise<void> {
		// get menu from guest experience

		try {
			console.log("Cashier: Listening to the menu from Manager.");

			await this.rabbitmq.receiveMessage("updatePrices", (data) => {
				if (!data || !data?.content) return console.log("Cashier: No data from Guest Experience received");
				const content = JSON.parse(data?.content?.toString());
				if (!content) return console.log("Cashier: No content in the data Guest Experience received");
				if (!this.isMenu(content)) return console.log("Cashier: Wrong data type menu from Guest Experience received");
				this.menu = content;
				console.log("Cashier: Got the menu from Manager.");
			});
		} catch (e) {
			console.log("Cashier: Couldn't get menu from Manager. Reason:");
			console.error(e.message);
		}
	}

	generateBill(guestDelivery: GuestOrders): GuestBill {
		// generate a bill from the unpaid items left for a certain customer

		const billIndex = this.bills.findIndex(bill => bill.guest === guestDelivery.guest);

		let newBill: Bill;

		if (billIndex >= 0) {
			const { bill, guest, orders } = this.bills[billIndex];
			const ordersCopy = orders.map(order => ( {
				order: order.order,
				food: [...order.food],
				drinks: [...order.drinks]
			} ));

			newBill = { bill, guest, orders: ordersCopy, totalSum: 0 };
		} else {
			newBill = { bill: this.billIdCounter, guest: guestDelivery.guest, orders: [], totalSum: 0 };

			this.billIdCounter++;
		}

		// add orders to the bill
		this.addFoodOrderToBill(guestDelivery, newBill);

		// calculate totalSum
		this.calculateTotalSum(newBill);

		if (billIndex >= 0) {
			this.bills.splice(billIndex, 1, newBill);
		} else {
			this.bills.push(newBill);
		}

		const { bill, orders, totalSum } = newBill;

		return {
			bill,
			orderedDrinks: orders.flatMap(order => order.drinks),
			orderedFood: orders.flatMap(order => order.food),
			totalSum: totalSum
		};
	}

	private addFoodOrderToBill(guestDelivery: GuestOrders, newBill: Bill) {
		guestDelivery.orders.forEach(order => {
			const existingOrder = newBill.orders?.find(billOrder => billOrder.order === order.order);

			if (existingOrder) {
				existingOrder.food = [...order.food];
				existingOrder.drinks = [...order.drinks];
			} else {
				newBill.orders.push({ order: order.order, food: [...order.food], drinks: [...order.drinks] });
			}
		});
	}

	private calculateTotalSum(newBill: Bill) {
		newBill.orders.forEach(order => {
			order.drinks.forEach(id => {
				const menuDrink = this.menu.drinks.find(drink => drink.id === id);

				newBill.totalSum += menuDrink.price;
			});

			order.food.forEach(id => {
				const menuFood = this.menu.food.find(food => food.id === id);

				newBill.totalSum += menuFood.price;
			});
		});
	}

	getPaymentOption(amount: number): PAYMENT_METHOD[] {
		// return the available payment options depending on the price

		const paymentMethods = [PAYMENT_METHOD.Cash];

		if (amount < 20) return paymentMethods;

		return [...paymentMethods, PAYMENT_METHOD.DebitCard, PAYMENT_METHOD.CreditCard];
	}

	registerPayment(billId: number) {
		// register a new payment and mark items as paid

		console.log("Cashier: I received a payment");

		const billIndex = this.bills.findIndex(bill => bill.bill === billId);
		const bill = this.bills[billIndex];
		const paidOrders = bill.orders.flatMap(order => ( {
			order: order.order,
			paidDrinks: [...order.drinks],
			paidFood: [...order.food]
		} ));

		const paidBill: PaidBill = {
			bill: billId,
			paidOrders,
			totalSum: bill.totalSum
		};

		// remove items from delivered items
		const { deliveredItemsIndex, deliveredOrders } = this.removeBillItemsFromDeliveredItems(bill);

		// remove empty orders
		this.guestOrders[deliveredItemsIndex].orders = deliveredOrders.filter(order => order.food.length > 0 || order.drinks.length > 0);

		// remove bill
		this.bills.splice(billIndex, 1);

		return paidBill;
	}

	private removeBillItemsFromDeliveredItems(bill: Bill) {
		const deliveredItemsIndex = this.guestOrders.findIndex(items => +items.guest === +bill.guest);
		const deliveredOrders = this.guestOrders[deliveredItemsIndex].orders;

		deliveredOrders.forEach(order => {
			const billOrder = bill.orders.find(orderObj => +orderObj.order === +order.order);

			if (billOrder) {
				billOrder.drinks.forEach(drinkId => {
					if (order.drinks.includes(drinkId)) {
						const index = order.drinks.findIndex(drink => drinkId === drink);
						order.drinks.splice(index, 1);
					}
				});

				billOrder.food.forEach(foodId => {
					if (order.food.includes(foodId)) {
						const index = order.food.findIndex(food => foodId === food);
						order.food.splice(index, 1);
					}
				});

			}
		});
		return { deliveredItemsIndex, deliveredOrders };
	}

	private async subscribeToDeliveries() {
		try {
			console.log("Cashier: I'm listening to bill delivery commands now.");

			await this.rabbitmq.receiveMessage("billDelivery", (data) => {
				if (!data) console.error("No data received");
				const deliveryId = data.properties.headers["deliveryId"];
				const parsedData = JSON.parse(data.content.toString());

				if (!this.isItemRegistration(parsedData)) return console.log("Received data doesn't match the required data type.");
				const { food, drinks } = parsedData;

				if (!deliveryId) {
					console.log("Cashier: I need a delivery Id to identify the delivery");
					return;
				}

				if (this.deliveryIds.includes(deliveryId)) {
					console.log("Cashier: I already registered this delivery");
					return;
				}

				this.deliveryIds.push(deliveryId);

				if (!food.length && !drinks.length) {
					console.log("Cashier: You need to send me items if I should register something");
					return;
				}

				console.log("Cashier: I'm registering a new delivery");
				this.registerDeliveredItems(parsedData);
			});
		} catch (e) {
			console.error(e);
		}
	}

	registerDeliveredItems(itemRegistration: ItemRegistration) {
		// register items which are delivered to a guest

		const { guest, order, food, drinks } = itemRegistration;

		const guestDelivery = this.guestOrders.find(items => +items.guest === +guest);

		if (guestDelivery) {
			const guestOrder = guestDelivery.orders.find(deliveryOrder => +deliveryOrder.order === +order);
			if (guestOrder) {
				console.log("Cashier: I'm adding items to an existing order");
				guestOrder.food = guestOrder.food.concat(food);
				guestOrder.drinks = guestOrder.drinks.concat(drinks);
			} else {
				console.log("Cashier: I'm adding a new order to an existing Guest with id " + guest);
				guestDelivery.orders.push({ food, drinks, order });
			}
		} else {
			console.log("Cashier: I'm adding a new guest with his first order");
			this.guestOrders.push({ guest, orders: [{ food, drinks, order }] });
		}

	}

	private isItemRegistration(itemRegistration: any): itemRegistration is ItemRegistration {
		return typeof itemRegistration === "object" &&
			itemRegistration !== null &&
			itemRegistration.hasOwnProperty("guest") &&
			typeof +itemRegistration["guest"] === "number" &&
			itemRegistration.hasOwnProperty("order") &&
			typeof +itemRegistration["order"] === "number" &&
			itemRegistration.hasOwnProperty("food") &&
			Array.isArray(itemRegistration["food"]) &&
			itemRegistration["food"].every(item => typeof +item === "number") &&
			itemRegistration.hasOwnProperty("drinks") &&
			Array.isArray(itemRegistration["drinks"]) &&
			itemRegistration["drinks"].every(item => typeof +item === "number");
	}

	private isMenu(menu: any): menu is Menu {
		return typeof menu === "object" &&
			menu !== null &&
			menu.hasOwnProperty("food") &&
			Array.isArray(menu["food"]) &&
			menu["food"].every(item => typeof item === "object" && typeof item?.id === "number" && typeof item?.price === "number") &&
			menu.hasOwnProperty("drinks") &&
			Array.isArray(menu["drinks"]) &&
			menu["drinks"].every(item => typeof item === "object" && typeof item?.id === "number" && typeof item?.price === "number");
	}
}

