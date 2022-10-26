// TO DO
// -provides a list of cookable meals with name and nutrition information
// Rules
// - only orders for a single menu item can be placed at once
// - meal preparation takes a defined time, which is calculated by the number of ingredients * 2.
// - when food is ordered, the number of meals that are prepared before the requested one is returned.
// - when a meal is prepared it is placed on the counter after its preparation time and delivery is notified.

import fetch from "node-fetch";
import path from "path";
import Cook from "./Cook";
import { CookableMeal, MealItem, OrderItem } from "./types";

export default class FoodPreparation {
    ordersInPreparation = 0;
    cooks = [new Cook(), new Cook(), new Cook()];
    cookableMeals = [
        {
            "id": 1,
            "name": "Burger",
            "nutrition": [ "A", "B", "C"],
            "ingredients": ["Meat", "Salad", "Tomato", "Bun"]
        },
        {
            "id": 2,
            "name": "Wiener Schnitzel",
            "nutrition": [ "D", "E"],
            "ingredients": ["Meat", "Potato", "Egg", "Breadcrumbs"]
        }
    ];
    counter: OrderItem[] = [];

    takeOrder(id: number, order: number): string {
        const orderedMeal = this.cookableMeals.find((meal) => { return meal.id == id});
        if(orderedMeal) {
            this.ordersInPreparation++;
            this.manageOrder(orderedMeal, order);
            return (this.ordersInPreparation.toString());
        } else {
            return undefined;
        }
    }

    private async manageOrder(orderedMeal: MealItem, order: number): Promise<void> {
        const cook = await this.getAvailableCook();
        if(cook) {
            await cook.prepareMeal(orderedMeal);
            this.counter.push({id:orderedMeal.id, order: order});
            this.notifyDelivery();
            this.ordersInPreparation--;
        }
    }

    private async getAvailableCook():Promise<Cook> {
        for(let cook of this.cooks) {
            if (!cook.isCooking) {
                return cook;
            }
        }
        await new Promise<void>((resolve) => {
            setTimeout(async()=> {
                resolve();
            },2000)})
        return await this.getAvailableCook();
    }

    getCookableMeals(): CookableMeal[] {
        let mealInformation: CookableMeal[] = [];
        this.cookableMeals.forEach((meal) => {
            const {ingredients, ...information} = meal;
            mealInformation.push(information);
        });
        return mealInformation;
    }

    private notifyDelivery(): void {
        const {id, order} = this.counter.shift();
        const path = process.env.API_DELIVERY || "Delivery:8084";
            fetch(`${path}/preparedNotification`,{
                method: "POST",
                body: JSON.stringify({"food": id,"order": order}),
                headers: { 'Content-Type': 'application/json' }
            }).catch (() => {
            console.log("An error occured trying to send a delivery notification");
        })
    }
}
