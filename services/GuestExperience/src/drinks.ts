import { NUTRITION } from "./types/types";

export const drinks = [
    {
        id: 1,
        name: "Soda",
        nutrition: [NUTRITION.H],
        price: 4.4,
    },
    {
        id: 2,
        name: "Beer",
        nutrition: [],
        price: 5.4,
    },
    {
        id: 3,
        name: "Coca Cola",
        nutrition: [NUTRITION.H, NUTRITION.C],
        price: 5.4,
    }
];