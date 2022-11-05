import { NUTRITION } from "./Types/types";

export const cookableMeals = [
    {
        "id": 1,
        "name": "Burger",
        "nutrition": [ NUTRITION.A, NUTRITION.B, NUTRITION.C],
        "ingredients": ["Meat", "Salad", "Tomato", "Bun"]
    },
    {
        "id": 2,
        "name": "Wiener Schnitzel",
        "nutrition": [ NUTRITION.D, NUTRITION.E],
        "ingredients": ["Meat", "Potato", "Egg", "Breadcrumbs"]
    },
    {
        "id": 3,
        "name": "Pommes",
        "nutrition": [ NUTRITION.A, NUTRITION.E],
        "ingredients": ["Potato"]
    }
];