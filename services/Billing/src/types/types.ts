export interface PaidOrder {
	order: number; // id of the order
	paidDrinks: number[];
	paidFood: number[];
}

export interface Bill {
	bill: number; // id of the bill
	orderedDrinks: number[];
	orderedFood: number[];
	totalSum: number; // in Euros
}

export interface PaidBill {
	bill: number; // id of the bill
	paidOrders: PaidOrder[];
}

export interface BillPayment {
	amount: number;
	paymentMethod: PAYMENT_METHOD;
}

export interface ItemRegistration {
	guest: number; // id of the guest
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
	nutrition: NUTRITION[];
	price: number;
}

export interface Menu {
	guest: number; // id of the guest
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