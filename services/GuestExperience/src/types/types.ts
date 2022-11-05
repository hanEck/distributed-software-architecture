export interface FoodItem { 
    id: number; 
    name: string; 
    nutrition: string[]; 
    price: number; 
}

export interface PriceItem {
    id: number;
    price: number;
}

export enum NUTRITION {
    A = "A",
	B = "B",
	C = "C",
	D = "D",
	E = "E",
	F = "F",
	G = "G",
    H = "H"
}