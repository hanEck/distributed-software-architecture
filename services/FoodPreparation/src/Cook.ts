import { MealItem } from "./Types/types";
import { delay } from "./Utils/Utils";

export default class Cook {
    isCooking: boolean = false;
    async prepareMeal(meal: MealItem): Promise<void> {
        this.isCooking = true;
        await delay(meal.ingredients.length * 2000);
        this.isCooking = false;
    }
}