import express = require("express");
import { BillPayment, ErrorMessage, GuestBill, GuestOrders, Log, LOG_TYPE, PaidBill, PAYMENT_METHOD } from "./types/types";
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
        console.log({
            type: LOG_TYPE.WARN,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "post /bills/:guestId",
                message: "Guest required: The guest id was not provided so I don't know who the bill is for"
            }
        } as Log);
		return res.send("Guest was not provided");
	}

	if (!billingService?.menu?.drinks || !billingService?.menu?.food) {
		res.status(404);
        console.log({
            type: LOG_TYPE.WARN,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "post /bills/:guestId",
                message: "I don't have the menu and can't calculate the total sum for the bill."
            }
        } as Log);
		return res.send("Sorry I don't have the menu. Please try again later.");
	}

	const guestDelivery: GuestOrders | undefined = billingService.guestOrders.find(items => +items.guest === +guestId);

	if (!guestDelivery) {
		res.status(404);
		console.log("Cashier: I couldn't find the guest with the specified id");
        console.log({
            type: LOG_TYPE.WARN,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "post /bills/:guestId",
                message: "Guest not found: I couldn't find the guest with the specified id"
            }
        } as Log);
		return res.send("Guest with the specified id has not been registered");
	}

	if (!guestDelivery.orders.length) {
		res.status(404);
        console.log({
            type: LOG_TYPE.INFO,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "post /bills/:guestId",
                message: "All Items paid: There are no items that need to be paid"
            }
        } as Log);
		return res.send("No billable items found");
	}

	if (billingService.bills.find(bill => bill.guest === guestId)) {
        console.log({
            type: LOG_TYPE.INFO,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "post /bills/:guestId",
                message: "Update Bill: I'm updating a bill"
            }
        } as Log);
		res.status(202);
	} else {
        console.log({
            type: LOG_TYPE.INFO,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "post /bills/:guestId",
                message: "Generating Bill: I'm generating a bill"
            }
        } as Log);
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
        console.log({
            type: LOG_TYPE.WARN,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "get /payment/:billId",
                message: "Bill not found: I can't find the bill if no id is provided"
            }
        } as Log);
		return res.send("Bill was not provided");
	}

	const bill = billingService.bills.find(bill => bill.bill === billId);

	if (!bill) {
		res.status(404);
        console.log({
            type: LOG_TYPE.WARN,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "get /payment/:billId",
                message: "Bill not found: Could not find the bill with the specified id"
            }
        } as Log);
		return res.send("Bill was not found");
	}

    console.log({
        type: LOG_TYPE.INFO,
        timestamp:Date.now(),
        serviceName: "Billing",
        event: {
            method: "get /payment/:billId",
            message: "Getting Payment options: I'm getting the payment options"
        }
    } as Log);
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
        console.log({
            type: LOG_TYPE.WARN,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "post /payment/:billId",
                message: "Bill not found: I can't find the bill if no id is provided"
            }
        } as Log);
		return res.send("Bill was not provided");
	}

	const bill = billingService.bills.find(bill => +bill.bill === billId);

	if (!bill) {
		res.status(410);
        console.log({
            type: LOG_TYPE.INFO,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "post /payment/:billId",
                message: "Bill already paid: The requested bill is already paid"
            }
        } as Log);
		return res.send("No payment for the bill required");
	}

	const possiblePaymentMethods = billingService.getPaymentOption(bill.totalSum);

	if (!possiblePaymentMethods.includes(billPayment.paymentMethod)) {
		res.status(406);
        console.log({
            type: LOG_TYPE.WARN,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "post /payment/:billId",
                message: "Payment method not supported: The used payment method isn't supported. Please try again."
            }
        } as Log);
		return res.send("Please use a supported payment method for this bill");
	}

	if (billPayment.amount < bill.totalSum) {
		res.status(416);
		console.log("Cashier: You didn't give me enough money to cover the bill");
        console.log({
            type: LOG_TYPE.INFO,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "post /payment/:billId",
                message: "Not enough money: The amount of money provided is not enough to cover the bill"
            }
        } as Log);
		return res.send(`Please pay at least ${bill.totalSum} euros to cover this bill`);
	}

	const paidBill = billingService.registerPayment(billId);

	res.status(202);
	res.send(paidBill);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});