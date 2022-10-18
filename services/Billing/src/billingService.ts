import { Bill, BillPayment, ItemRegistration, Menu } from "./types/types";

export default class BillingService {
	bills: Bill[] = [];
	deliveredItems: ItemRegistration[] = [];
	menu: Menu;

	constructor() {
		// call getMenu to get the restaurant menu on initialization
	}

	async getMenu() {
		// get menu from guest experience
	}

	getBill(guestId: number) {
		// look through delivered items and see if there are unpaid items left for a certain customer
	}

	getPaymentOption(guestId: number, billId: number) {
		// return the available payment options depending on the price
	}

	registerPayment(guestId: number, payment: BillPayment) {
		// register a new payment and mark items as paid
	}

	registerDeliveredItems(guestId: number, foodItems: number[], drinkItems: number[]) {
		// check if guest already exists in array
		// if so add the delivered items to the array entry
		// if not create a new array entry
	}
}

