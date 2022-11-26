export interface Menu {
    guest: number, 
    food: MenuItem[], 
    drinks: MenuItem[]
}
export interface MenuItem { 
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