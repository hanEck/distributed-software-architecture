import {Console} from "console";
import fetch from "node-fetch";
import {Order} from "./types";
import amqp, {connect} from "amqplib";
import {createConnection} from "net";

let orderNumber = 1;
const averageWaitingTimePerGuest = 4;
const forgetfulnessThreshold =
    parseFloat(process.env.FORGETTABLE_WAITER_RATIO) || 0.1;

export async function processOrder(order: Order) {
    const connection = await connectToRabbitMq();
    sendOrder(connection, order);

    const waitingTime = getWaitingTime();

    // const highestOrderPosition = await sendFoodToFoodPreparation(order);
    // await sendOrderToDelivery(order);
    // const waitingTime = calculateWaitingTime(highestOrderPosition);

    return {waitingTime, order: orderNumber - 1};
}

// async function sendOrderToDelivery(order: Order) {
//   const sentOrder = {
//     guest: order.guest,
//     food: order.food,
//     drinks: order.drinks || [],
//     order: orderNumber,
//   };
//   orderNumber++;
//   fetch("http://Delivery:8084/orderInformation", {
//     method: "POST",
//     body: JSON.stringify(sentOrder),
//     headers: { "Content-Type": "application/json" },
//   });
// }

async function sendOrder(connection: any, order: Order) {
    const iForgot = Math.random();
    const processedOrder = {
        guest: order.guest,
        food: order.food || [],
        drinks: order.drinks || [],
        order: orderNumber,
    };
    orderNumber++;

    if (iForgot <= forgetfulnessThreshold) {
        console.log("Duplicated order is being sent");
        await sendPlacedOrder(connection, processedOrder);
        await sendPlacedOrder(connection, processedOrder);
    } else {
        await sendPlacedOrder(connection, processedOrder);
    }
}

function calculateWaitingTime(highestOrderPosition: number) {
    let waitingTime = highestOrderPosition * averageWaitingTimePerGuest;
    return waitingTime;
}

async function connectToRabbitMq() {
    try {
        const connection = await connect({
            hostname: "RabbitMQ",
            port: 5672,
            username: process.env.RABBITMQ_DEFAULT_USER || "admin",
            password: process.env.RABBITMQ_DEFAULT_PASS || "admin1234",
        });
        console.log("Successfully connected to RabbitMQ");
        return connection;
    } catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
    }
}

async function sendPlacedOrder(connection: amqp.Connection, order: any) {
    try {
        const channel = await connection.createChannel();

        const exchange = "placedOrder";

        await channel.assertExchange(exchange, "fanout", {durable: true});

        const routingKey = "newOrder";
        const eventBuffer = Buffer.from(JSON.stringify(order));
        channel.publish(exchange, "", eventBuffer);

        setTimeout(function () {
            connection.close();
        }, 500);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

async function getWaitingTime() {
    const connection = await connectToRabbitMq();
    const channel = await connection.createChannel();
    await channel.assertQueue("updateWaitingTime", {durable: true});
    channel.consume("updateWaitingTime", (message) => {
        const highestOrderPosition = JSON.parse(message.content.toString());
        console.log(
            `Received Message for queue updateWaitingTime: ${highestOrderPosition}`
        );
        const waitingTime = calculateWaitingTime(highestOrderPosition);
        console.log(`Waiting Time: ${waitingTime}`);
        return waitingTime;
    });
}
