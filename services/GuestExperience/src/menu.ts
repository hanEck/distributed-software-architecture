import fetch from "node-fetch";
import { drinks } from "./drinks";
import { FoodItem, PriceItem } from "./types/types";
import {delay, isEmptyObject} from "./utils";


let guestId = 0;
let menu = {};
const price = [20.2, 10.2, 5.3];

let currentRetry = 0;
const maxRetry = 3;

export async function createMenu(): Promise<any> {
    try {
        const response = await fetch("http://FoodPreparation:8085/meals");
        const meals = await response.json();
        const food = addPriceToFood(meals);
        currentRetry = 0;
        console.log("Manager: Communication worked!!!")
        menu = {guest: guestId++, food: food, drinks: drinks}
        return menu;
    } catch (error) {
        console.log("Manager: Communication with the cook did not work!");

        //Let's retry 
        currentRetry++;
        console.log("Manager: we have now retryed it for the " + currentRetry + " Time");
        checkCache();
        await delay(100 * currentRetry);
        return (await createMenu())
    }
    
}

function checkCache() {
    if (currentRetry >= maxRetry && !isEmptyObject(menu)) {
            console.log("Manager: Now we have to use the cache!")
            currentRetry = 0;
            return menu;
        }
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

        menu?.food.forEach((foodItem: PriceItem) => {
            const menuItem = {
                id: foodItem.id,
                price: foodItem.price
            }
            foodPrices.push(menuItem);
            }
        );

        menu?.drinks.forEach((drinkItem: PriceItem) => {
            const menuItem = {
                id: drinkItem.id,
                price: drinkItem.price
            }
            drinkPrices.push(menuItem);
            }
        );

        return {food: foodPrices, drinks: drinkPrices};
}

