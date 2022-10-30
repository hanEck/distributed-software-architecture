export interface PaidOrder {
	order: number; // id of the order
	paidDrinks: number[];
	paidFood: number[];
}

export interface Bill {
	bill: number; // id of the bill
	order: number;
	orderedDrinks: number[];
	orderedFood: number[];
	totalSum: number; // in Euros
}

export interface PaidBill {
	bill: number; // id of the bill
	paidOrders: PaidOrder[];
	totalSum: number
}

export interface BillPayment {
	amount: number;
	paymentMethod: PAYMENT_METHOD;
}

export interface ItemRegistration {
	guest: number; // id of the guest
	order: number; // id of the order
	food: number[];
	drinks: number[];
}

export enum PAYMENT_METHOD {
	Cash = "Cash",
	DebitCard = "DebitCard",
	CreditCard = "CreditCard",
}

export interface MenuItem {
	id: number;
	name: string;
	price: number;
}

export interface Menu {
	food: MenuItem[];
	drinks: MenuItem[];
}

export enum NUTRITION {
	A = "A",
	B = "B",
	C = "C",
	D = "D",
	E = "E",
	F = "F",
	G = "G",
	H = "H",
	L = "L",
	M = "M",
	N = "N",
	O = "O",
	P = "P",
	R = "R"
}

export type ErrorMessage = string;