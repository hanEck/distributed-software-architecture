import fetch from "node-fetch";
import { drinks } from "./drinks";
import { FoodItem, PriceItem } from "./types";


let guest = 1;
const price = [20.2, 10.2];


export async function createMenu() {

    const response = await fetch("http://FoodPreparation:8085/meals");
    const meals = await response.json();

    const food = addPriceToFood(meals);
    return {guest: guest++, food: food, drinks: drinks};
}

function addPriceToFood(foodNames: { name: string; nutrition: string[]; }[]) {
    let food: FoodItem[]  = [];

    foodNames.forEach((item, index) => {
        const idNumber = ++index;
        const foodItem: FoodItem = {
            id: idNumber,
            name: item.name,
            nutrition: item.nutrition,
            price: price[index - 1],
        };
        food.push(foodItem);
        }
    );

    return food;
}

export async function getMenuItemPrices() {
    const menu = await createMenu();
    let foodPrices: PriceItem[] = [];
    let drinkPrices: PriceItem[] = [];

   
    menu.food.forEach((foodItem: PriceItem) => {
        const menuItem = {
            id: foodItem.id,
            price: foodItem.price
        }
        foodPrices.push(menuItem);
        }
    );

    menu.drinks.forEach((drinkItem: PriceItem) => {
        const menuItem = {
            id: drinkItem.id,
            price: drinkItem.price
        }
        drinkPrices.push(menuItem);
        }
    );

    return {food: foodPrices, drinks: drinkPrices};
}
