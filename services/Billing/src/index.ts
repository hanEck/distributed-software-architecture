import express = require("express");
import { Bill, BillPayment, ItemRegistration, PaidBill, PAYMENT_METHOD } from "./types/types";

const port = parseInt(process.env.PORT, 10) || 3000;
const myTargetConfiguration = process.env.MY_TARGET_CONFIGURATION || "http://google.com";

const app = express();

app.post<string, {guest: number}, Bill>("/bills/:guestId", (req, res) => {

});

app.get<string, {bill: number}, PAYMENT_METHOD[]>("/payment/:billId", (req, res) => {

});

app.post<string, any, PaidBill, BillPayment>("/payment/:billId", (req, res) => {

});

app.post<string, any, any, ItemRegistration>("/registerDelivery", (req, res) => {

});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});