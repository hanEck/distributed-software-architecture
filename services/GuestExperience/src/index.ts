import express = require("express");
import { createMenu, getMenuItemPrices } from "./menu";
import { delay, getPossibleDelay } from "./utils";
import amqp, { connect } from "amqplib";
import { Response } from "express-serve-static-core";
import { Log, LOG_TYPE, Menu } from "./types/types";

const port = parseInt(process.env.PORT, 10) || 3000;

const app = express();
let meals: { name: string; nutrition: string[]; }[];
let connection: amqp.Connection;

async function connectToRabbitMq() {
    try {
        const connection = await connect({
            hostname: "RabbitMQ",
            port: 5672,
            username: process.env.RABBITMQ_DEFAULT_USER || "admin",
            password: process.env.RABBITMQ_DEFAULT_PASS || "admin1234"
        });
        console.log({
            type: LOG_TYPE.INFO,
            timestamp:Date.now(),
            serviceName: "Guest Experience",
            event: {
                method: "connectToRabbitMq",
                message: "Successfully connected to RabbitMQ"
            }
        } as Log);
        return connection;
    } catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
        console.log({
            type: LOG_TYPE.ERROR,
            timestamp:Date.now(),
            serviceName: "Guest Experience",
            event: {
                method: "connectToRabbitMq",
                message: "Error connecting to RabbitMQ: " + error
            }
        } as Log);
    }
}

async function sendMessage(connection: amqp.Connection, message: any) {
    try {
        const channel = await connection.createChannel();
        const queue = "updatePrices";
        console.log("Manager: " + message);

        await channel.assertQueue(queue, { durable: true });
        // @ts-ignore
        channel.sendToQueue(queue, Buffer.from(message));

        console.log({
            type: LOG_TYPE.INFO,
            timestamp:Date.now(),
            serviceName: "Guest Experience",
            event: {
                method: "sendMessage " + queue,
                message: "Message Sent to Queue: " + queue + " with message: " + message
            }
        } as Log);
    } catch (error) {
        console.log({
            type: LOG_TYPE.ERROR,
            timestamp:Date.now(),
            serviceName: "Guest Experience",
            event: {
                method: "sendMessage updatePrices",
                message: "Error sending message: " + error
            }
        } as Log);
    }
}

async function main() {
    connection = await connectToRabbitMq();
    getFood()

}

main().then(() => console.log("Sending test message successful!"));

async function getFood() {
    try {
        const channel = await connection.createChannel();
        await channel.assertQueue("updateFood", { durable: true });
        channel.consume("updateFood", async (message) => {
            meals = JSON.parse(message.content.toString());
            createMenu(meals)
            let prices = await getPrices();
            await sendMessage(connection, JSON.stringify(prices));
        })
    } catch (error) {
        console.log({
            type: LOG_TYPE.ERROR,
            timestamp:Date.now(),
            serviceName: "Guest Experience",
            event: {
                method: "getFood",
                message: "Error receiving message: " + error
            }
        } as Log);
    }

}


async function getPrices() {
    // await getPossibleDelay();
    const prices = await getMenuItemPrices()

    if (!prices?.drinks?.length || !prices?.food?.length) {
        console.log("No prices and no Food");
    }

    return prices;
}

app.get("/menu", async (req, res) => {
    const menu = await sendMenu()
    res.json(menu);

});

async function sendMenu(): Promise<Menu> {
    if (meals != null) {
        const menu = createMenu(meals)
        return menu
    }
    else {
        console.log("Menu is null");
        await delay(100);
        return await sendMenu()
    }

}


app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});