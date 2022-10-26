export interface MealItem {
    "id": number,
    "name": string,
    "nutrition": Array<string>,
    "ingredients": Array<string>
}

export interface CookableMeal {
    "name": string, 
    "nutrition": Array<string>
}

export interface OrderItem {
    id: number, 
    order:number
}