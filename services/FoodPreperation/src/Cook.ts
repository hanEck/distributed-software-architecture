import { MealItem } from "./types";

export default class Cook {
    isCooking: boolean = false;
    async prepareMeal(meal: MealItem): Promise<void> {
        this.isCooking = true;
        await cookingDelay(meal.ingredients.length);
        console.log("cook is done");
        this.isCooking = false;
    }
}

function cookingDelay(factor: number) {
    return (new Promise((resolve) => {
        setTimeout(resolve,2000 * factor);
    }))
}