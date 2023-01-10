import fetch from "node-fetch";
import Cook from "./Cook";
import { cookableMeals } from "./Meals";
import { CookableMeal, MealItem, OrderItem } from "./Types/types";
import RabbitMQ from "./Utils/RabbitMQ";
import { delay } from "./Utils/Utils";

export default class FoodPreparation {
    ordersInPreparation = 0;
    cooks = [new Cook(), new Cook(), new Cook()];
    cookableMeals = cookableMeals
    counter: OrderItem[] = [];

    takeOrder(id: number, order: number): string | undefined {
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
        await delay(2000);
        return await this.getAvailableCook();
    }

    getCookableMeals(): CookableMeal[] {
        const mealInformation: CookableMeal[] = [];
        this.cookableMeals.forEach((meal) => {
            const {ingredients, ...information} = meal;
            mealInformation.push(information);
        });
        return mealInformation;
    }

    private notifyDelivery(): void {
        const {id, order} = this.counter.shift();
        const broker = new RabbitMQ();
        broker.sendMessage("deliverFood", {food: id, order: order});
    }
}
