import express = require("express");
import { BillPayment, ErrorMessage, GuestBill, GuestOrders, PaidBill, PAYMENT_METHOD } from "./types/types";
import BillingService from "./billingService";
import * as os from "os";

const port = parseInt(process.env.PORT, 10) || 3000;

const app = express();
app.use(express.json());

const billingService = new BillingService();

// service health check
app.get("/health", (req, res) => {
	const mem = os.freemem();
	const cpu = os.loadavg()[0];

	if (mem < 100000000 || cpu > 5) {
		console.warn("Billing unhealthy");
		return res.status(500).send({
			message: "Billing Service is unhealthy"
		});
	}

	return res.send({
		message: "Billing Service is healthy"
	});
});

// Generates the bill for a guest with all unpaid but delivered items
app.post<string, {guestId: string}, GuestBill | ErrorMessage>("/bills/:guestId", (req, res) => {
	const guestId = parseInt(req.params.guestId);

	if (!guestId) {
		res.status(400);
		console.log("Cashier: The guest id was not provided so I don't know who the bill is for");
		return res.send("Guest was not provided");
	}

	if (!billingService?.menu?.drinks || !billingService?.menu?.food) {
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

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});