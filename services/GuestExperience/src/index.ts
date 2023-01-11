import express = require("express");
import {createMenu, getMenuItemPrices} from "./menu";
import { delay, getPossibleDelay } from "./utils";
import amqp, { connect } from "amqplib";
import { Response } from "express-serve-static-core";
import { Menu } from "./types/types";

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
		console.log("Successfully connected to RabbitMQ");
		return connection;
	} catch (error) {
		console.error("Error connecting to RabbitMQ:", error);
	}
}

async function sendMessage(connection: amqp.Connection, message: any) {
	try {
		const channel = await connection.createChannel();
		const queue = "updatePrices";

		await channel.assertQueue(queue, { durable: true });
		// @ts-ignore
		channel.sendToQueue(queue, Buffer.from(message));

		console.log(`Sent message: ${message}`);
	} catch (error) {
		console.error("Error sending message:", error);
	}
}

async function main() {
    connection = await connectToRabbitMq();
	await sendMessage(connection, JSON.stringify(getPrices()));
    getFood()
}

main().then(() => console.log("Sending test message successful!"));

async function getFood() {
    const channel = await connection.createChannel();
    await channel.assertQueue("updateFood", { durable: true });
    channel.consume("updateFood", (message) => {
        meals = JSON.parse(message.content.toString());
        createMenu(meals)
    })
}


async function getPrices() {
    await getPossibleDelay();
    const prices = await getMenuItemPrices()
    
    if(!prices?.drinks?.length || !prices?.food?.length){
    //     res.status(404);
    //     return res.send()
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
        console.log("Manager: " + menu);
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