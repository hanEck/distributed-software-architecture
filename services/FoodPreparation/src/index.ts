import express = require("express");
import FoodPreparation from "./FoodPreperation";
import { CookableMeal, OrderItem } from "./Types/types";
import Idempotency from "./Utils/Idempotency";
import RabbitMQ from "./Utils/RabbitMQ";

const port = parseInt(process.env.PORT, 10) || 3000;
const app = express();
app.use(express.json());
app.use((err: Error, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError) {
        console.error(err);
        return res.status(400).send({ status: 404, message: "Invalid JSON" }); // Bad request
    }
    next();
});

const broker = RabbitMQ.getInstance();
const foodPreparation = new FoodPreparation();
const idempotencyPattern = new Idempotency();
const cookableMeals = foodPreparation.getCookableMeals();

broker.sendMessage("updateFood", cookableMeals);

broker.consumeEvent("placedOrder", (msg) => {
    const {food = undefined, order} = JSON.parse(msg.content.toString());

    if(food === undefined || order === undefined) {
        console.log("Food Preparation: You tried to submit an empty order");
        if(idempotencyPattern.checkMessage(order)) {
            let ordersInQueue;
            food.forEach((id: number) => {      
                ordersInQueue = foodPreparation.takeOrder(id,order);
                if(!ordersInQueue) {
                    console.log("Food Preparation: No Meal found under this id");
                } else {
                    console.log("Food Preparation: Order is in queue");
                }
            });
            broker.sendMessage("updateWaitingTime", ordersInQueue);
        } else {
            console.log("Food Preparation: Order is already in queue");
        }
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});