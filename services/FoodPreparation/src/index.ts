import express = require("express");
import FoodPreparation from "./FoodPreperation";
import { CookableMeal, OrderItem } from "./Types/types";

const port = parseInt(process.env.PORT, 10) || 3000;
const propability = parseFloat(process.env.BUSY_COOK) || 0.1;
const app = express();
app.use(express.json());
app.use((err: Error, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError) {
        console.error(err);
        return res.status(400).send({ status: 404, message: "Invalid JSON" }); // Bad request
    }
    next();
});

const foodPreparation = new FoodPreparation();

app.get<any, void, any>("/meals", (req,res) => {
    const cookableMeals = foodPreparation.getCookableMeals();
    if(Math.random() > propability) {
        res.status(505).send({ status: 505, message: "Cook is busy" });
    } else {
        res.status(200).json(cookableMeals);
    }
});

app.post<any, OrderItem, string>("/orderItem", (req ,res) => {
    const {id, order} = req.body;
    if(id === undefined || order === undefined) {
        res.status(400).send("You tried to submit an empty order");
    } 
    const ordersInQueue: string = foodPreparation.takeOrder(id,order);
    if(!ordersInQueue) {
        res.status(404).send("No Meal found under this id");
    } else {
        res.status(200).send(ordersInQueue);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});