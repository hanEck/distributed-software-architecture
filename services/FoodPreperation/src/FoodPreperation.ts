// TO DO
// -provides a list of cookable meals with name and nutrition information
// Rules
// - only orders for a single menu item can be placed at once
// - meal preparation takes a defined time, which is calculated by the number of ingredients * 2.
// - when food is ordered, the number of meals that are prepared before the requested one is returned.
// - when a meal is prepared it is placed on the counter after its preparation time and delivery is notified.

import { resolveSrv } from "dns";
import fetch from "node-fetch";
import Cook from "./Cook";
import { MealItem } from "./types";

export default class FoodPreparation {
    ordersInPreparation: number = 0;
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
    counter: number[] = [];

    takeOrder(id: number): number {
        const orderedMeal = this.cookableMeals.find((meal) => { return meal.id == id});
        console.log(orderedMeal);
        this.ordersInPreparation++;
        console.log(this.ordersInPreparation);
        this.manageOrder(orderedMeal);
        return (this.ordersInPreparation);
    }
    async manageOrder(orderedMeal: MealItem): Promise<void> {
        const cook = await this.getAvailableCook();
        await cook.prepareMeal(orderedMeal);
        this.counter.push(orderedMeal.id);
        //this.notifyDelivery();
        this.ordersInPreparation--;
        console.log(this.ordersInPreparation);
    }
    getOrdersInPreparation(): number {
        return this.ordersInPreparation;
    }
    async getAvailableCook(): Promise<Cook> {
        for(let cook of this.cooks) {
            if (!cook.isCooking) {
                return cook;
            }
        }
        await new Promise<void>((resolve) => {
            setTimeout(()=> {
                this.getAvailableCook();
                resolve();
            },2000)})
    }
    getCookableMeals(): { name: string; nutrition: string[]; }[] {
        let mealInformation: { name: string; nutrition: string[]; }[] = [];
        this.cookableMeals.forEach((meal) => {
            const {ingredients, ...information} = meal;
            mealInformation.push(information);
        });
        return mealInformation;
    }
    notifyDelivery(): void {
        const meal = this.counter.shift();
        const path = process.env.API_DELIVERY || "Delivery:8084";
        fetch(`${path}/preparedNotification`,{
            method: "POST",
            body: JSON.stringify({"food": meal}),
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
