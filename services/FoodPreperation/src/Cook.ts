import { MealItem } from "./types";

export default class Cook {
    isCooking: boolean = false;
    async prepareMeal(meal: MealItem): Promise<void> {
        this.isCooking = true;
        console.log("cook is cooking");
        await setTimeout(()=>{},2000 * meal.ingredients.length);
        this.isCooking = false;
    }
}