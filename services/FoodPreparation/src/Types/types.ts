export interface MealItem {
    "id": number,
    "name": string,
    "nutrition": Array<NUTRITION>,
    "ingredients": Array<string>
}

export interface CookableMeal {
    "name": string, 
    "nutrition": Array<NUTRITION>
}

export interface OrderItem {
    id: number, 
    order:number
}

export enum NUTRITION {
    A = "A",
	B = "B",
	C = "C",
	D = "D",
	E = "E",
	F = "F",
	G = "G"
}