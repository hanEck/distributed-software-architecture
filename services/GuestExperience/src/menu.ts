import fetch from "node-fetch";
import { drinks } from "./drinks";
import { Menu, MenuItem, PriceItem } from "./types/types";
import { delay, isEmptyObject } from "./utils";


let guestId = 1;
let menu: Menu | undefined = undefined;
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
        console.log("Manager: " + guestId);
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
    let food: MenuItem[]  = [];

    foodNames.forEach((item, index) => {
        const idNumber = ++index;
        const foodItem: MenuItem = {
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

export async function getMenuItemPrices(): Promise<{food: PriceItem[], drinks: PriceItem[]} | undefined> {
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

