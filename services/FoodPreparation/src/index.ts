import express = require("express");
import FoodPreparation from "./FoodPreperation";
import { CookableMeal, Log, LOG_TYPE, OrderItem } from "./Types/types";
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
    const {food, order} = JSON.parse(msg.content.toString());  
    
    if(!food != null || order != null) {
        console.log({
            type: LOG_TYPE.INFO,
            timestamp: Date.now(),
            serviceName: "Food Preparation",
            event: {
                method: "received placedOrder Event",
                order: order,
                message: "Empty Order: You tried to submit an empty order"
            }
        } as Log);
    } else {
        if(idempotencyPattern.checkMessage(order)) {
            let ordersInQueue;
            food.forEach((id: number) => {      
                ordersInQueue = foodPreparation.takeOrder(id,order);
                if(!ordersInQueue) {
                    console.log({
                        type: LOG_TYPE.INFO,
                        timestamp:Date.now(),
                        serviceName: "Food Preparation",
                        event: {
                            method: "received placedOrder Event",
                            order: order,
                            message: "No Meal with ID: No Meal found under this id"
                        }
                    } as Log);
                } else {
                    console.log({
                        type: LOG_TYPE.INFO,
                        timestamp:Date.now(),
                        serviceName: "Food Preparation",
                        event: {
                            method: "received placedOrder Event",
                            order: order,
                            message: "Order has been placed into queue"
                        }
                    } as Log);
                }
            });
            broker.sendMessage("updateWaitingTime", ordersInQueue);
        } else {
            
            console.log({
                type: LOG_TYPE.INFO,
                timestamp:Date.now(),
                serviceName: "Food Preparation",
                event: {
                    method: "received placedOrder Event",
                    order: order,
                    message: "Dublicate Order: Order has already been placed"
                }
            } as Log);
        }
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});