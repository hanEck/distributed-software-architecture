import express = require("express");
import { Bill, BillPayment, ErrorMessage, ItemRegistration, PaidBill, PAYMENT_METHOD } from "./types/types";
import BillingService from "./billingService";

const port = parseInt(process.env.PORT, 10) || 3000;
const myTargetConfiguration = process.env.MY_TARGET_CONFIGURATION || "http://google.com";

const app = express();
app.use(express.json());

const billingService = new BillingService();

// Generates the bill for a guest with all unpaid but delivered items
app.post<string, {guestId: string}, Bill | ErrorMessage>("/bills/:guestId", (req, res) => {
	const guestId = parseInt(req.params.guestId);

	if (!guestId) {
		res.status(400);
		return res.send("Guest was not provided");
	}

	const guestDelivery: ItemRegistration | undefined = billingService.deliveredItems.find(items => items.guest === guestId);

	if (!guestDelivery) {
		res.status(404);
		return res.send("Guest with the specified id could not be found");
	}

	if (!guestDelivery.drinks.length && !guestDelivery.food.length) {
		res.status(404);
		return res.send("No billable items found");
	}

	// TODO: response with code 202

	const bill = billingService.generateBill(guestDelivery);

	res.status(200);
	res.send(bill);
});

// Returns the payment options for a bill
app.get<string, {billId: string}, PAYMENT_METHOD[] | ErrorMessage>("/payment/:billId", (req, res) => {
	const billId = parseInt(req.params.billId);

	if (!billId) {
		res.status(400);
		return res.send("Bill was not provided");
	}

	const bill = billingService.bills.find(bill => bill.bill === billId);

	if (!bill) {
		res.status(404);
		return res.send("Bill was not found");
	}

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
		return res.send("Bill was not provided");
	}

	const bill = billingService.bills.find(bill => bill.bill === billId);

	if (!bill) {
		res.status(410);
		return res.send("No payment for the bill required");
	}

	const possiblePaymentMethods = billingService.getPaymentOption(bill.totalSum);

	if (!possiblePaymentMethods.includes(billPayment.paymentMethod)) {
		res.status(406);
		return res.send("Please use a supported payment method for this bill");
	}

	if (billPayment.amount < bill.totalSum) {
		res.status(416);
		return res.send(`Please pay at least ${bill.totalSum} euros to cover this bill`);
	}

	const paidBill = billingService.registerPayment(billId);

	res.status(202);
	res.send(paidBill);
});

// Registers items as delivered, when they are delivered to a guest
app.post<string, any, any, ItemRegistration>("/registerDelivery", (req, res) => {
	const itemRegistration = req.body;
	const { guest, food, drinks } = itemRegistration;

	if (typeof guest !== "number") {
		res.status(400);
		return res.send("No guest was specified");
	}

	if (!food.length && !drinks.length) {
		res.status(416);
		return res.send("No items were specified for registration");
	}

	billingService.registerDeliveredItems(itemRegistration);

	res.status(200);
	res.send("Items have been registered successfully");
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});