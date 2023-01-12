export interface PaidOrder {
	order: number; // id of the order
	paidDrinks: number[];
	paidFood: number[];
}

export interface Order {
	order: number; // id of the order
	drinks: number[];
	food: number[];
}

export interface GuestBill {
	bill: number; // id of the bill
	orderedDrinks: number[];
	orderedFood: number[];
	totalSum: number; // in Euros
}

export interface Bill {
	bill: number; // id of the bill
	guest: number; // id of the guest
	orders: Order[];
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
	deliveryId: number;
	guest: number; // id of the guest
	order: number; // id of the order
	food: number[];
	drinks: number[];
}

export interface GuestOrders {
	guest: number; // id of the guest
	orders: Order[];
}

export enum PAYMENT_METHOD {
	Cash = "Cash",
	DebitCard = "DebitCard",
	CreditCard = "CreditCard",
}

export interface MenuItem {
	id: number;
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