import express = require("express");
import { BillPayment, ErrorMessage, GuestBill, GuestOrders, ItemRegistration, PaidBill, PAYMENT_METHOD } from "./types/types";
import BillingService from "./billingService";

const port = parseInt(process.env.PORT, 10) || 3000;
const BUSY_THRESHOLD = parseFloat(process.env.BUSY_THRESHOLD) || 0.1;

const app = express();
app.use(express.json());

const billingService = new BillingService();

// Generates the bill for a guest with all unpaid but delivered items
app.post<string, {guestId: string}, GuestBill | ErrorMessage>("/bills/:guestId", (req, res) => {
	const guestId = parseInt(req.params.guestId);

	if (!guestId) {
		res.status(400);
		console.log("Cashier: The guest id was not provided so I don't know who the bill is for");
		return res.send("Guest was not provided");
	}

	if (!billingService.menu) {
		res.status(404);
		console.log("Cashier: I don't have the menu and can't calculate the total sum for the bill.");
		return res.send("Sorry I don't have the menu. Please try again later.");
	}

	const guestDelivery: GuestOrders | undefined = billingService.guestOrders.find(items => +items.guest === +guestId);

	if (!guestDelivery) {
		res.status(404);
		console.log("Cashier: I couldn't find the guest with the specified id");
		return res.send("Guest with the specified id has not been registered");
	}

	if (!guestDelivery.orders.length) {
		res.status(404);
		console.log("Cashier: There are no items that need to be paid");
		return res.send("No billable items found");
	}

	if (billingService.bills.find(bill => bill.guest === guestId)) {
		console.log("Cashier: I'm updating a bill");
		res.status(202);
	} else {
		console.log("Cashier: I'm generating a bill");
		res.status(200);
	}

	const guestBill = billingService.generateBill(guestDelivery);

	res.send(guestBill);
});

// Returns the payment options for a bill
app.get<string, {billId: string}, PAYMENT_METHOD[] | ErrorMessage>("/payment/:billId", (req, res) => {
	const billId = parseInt(req.params.billId);

	if (!billId) {
		res.status(400);
		console.log("Cashier: I can't find the bill if no id is provided");
		return res.send("Bill was not provided");
	}

	const bill = billingService.bills.find(bill => bill.bill === billId);

	if (!bill) {
		res.status(404);
		console.log("Cashier: I couldn't find the bill");
		return res.send("Bill was not found");
	}

	console.log("Cashier: I'm getting the payment options'");
	const paymentMethods = billingService.getPaymentOption(bill.totalSum);

	res.status(200);
	res.send(paymentMethods);
});

// Pays a bill
app.post<string, {billId: string}, PaidBill | ErrorMessage, BillPayment>("/payment/:billId", (req, res) => {
	const billPayment = req.body;
	const billId = parseInt(req.params.billId);

	if (!billId) {
		res.status(400);
		console.log("Cashier: I can't find the bill if no id is provided");
		return res.send("Bill was not provided");
	}

	const bill = billingService.bills.find(bill => +bill.bill === billId);

	if (!bill) {
		res.status(410);
		console.log("Cashier: The requested bill is already paid");
		return res.send("No payment for the bill required");
	}

	const possiblePaymentMethods = billingService.getPaymentOption(bill.totalSum);

	if (!possiblePaymentMethods.includes(billPayment.paymentMethod)) {
		res.status(406);
		console.log("Cashier: The used payment method isn't supported. Please try again.");
		return res.send("Please use a supported payment method for this bill");
	}

	if (billPayment.amount < bill.totalSum) {
		res.status(416);
		console.log("Cashier: You didn't give me enough money to cover the bill");
		return res.send(`Please pay at least ${bill.totalSum} euros to cover this bill`);
	}

	const paidBill = billingService.registerPayment(billId);

	res.status(202);
	res.send(paidBill);
});

// Registers items as delivered, when they are delivered to a guest
app.post<string, {guestId: string}, any, ItemRegistration>("/registerDelivery/:guestId", (req, res) => {
	const guestId = parseInt(req.params.guestId);
	const deliveryId = Number(req.header("deliveryId"));
	const body = req.body;
	const { food, drinks } = body;

	const amIBusy = Math.random();
	if (amIBusy <= BUSY_THRESHOLD) {
		res.status(500);
		console.log("Cashier: I'm busy at the moment, please try again later");
		return res.send("Sorry I'm busy!");
	}

	if (!deliveryId) {
		res.status(400);
		console.log("Cashier: I need a delivery Id to identify the delivery");
		return res.send("Please send a delivery Id to identify the delivery.");
	}

	if (billingService.deliveryIds.includes(deliveryId)) {
		res.status(400);
		console.log("Cashier: I already registered this delivery");
		return res.send("I already received this delivery.");
	}

	billingService.deliveryIds.push(deliveryId);

	if (typeof guestId !== "number") {
		res.status(400);
		console.log("Cashier: There was no guest provided to register the items to");
		return res.send("No guest was specified");
	}

	if (!food.length && !drinks.length) {
		res.status(416);
		console.log("Cashier: You need to send me items if I should register something");
		return res.send("No items were specified for registration");
	}

	console.log("Cashier: I'm registering a new delivery");
	billingService.registerDeliveredItems({ ...body, guest: guestId });

	res.status(200);
	res.send("Items have been registered successfully");
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});