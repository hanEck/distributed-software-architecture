import express = require("express");
import bodyParser = require("body-parser");
import { PreparedFood, ReceivedOrderInformation } from './interfaces'
import { manageOrder, findOrder } from './Delivery'
import amqp, { connect } from "amqplib";

const port = parseInt(process.env.PORT, 10) || 3000;

const app = express();
app.use((req, res, next) => {
    bodyParser.json()(req, res, err => {
        if (err) {
            return res.status(400).send(`The send body is not a valid JS object!`)
        }
        next();
    })
});

main();

async function main() {
    const connection = await connectToRabbitMq();
    await subscribeToPlacedOrderEvent(connection, "Hello, RabbitMQ!");
}


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

async function subscribeToPlacedOrderEvent(connection: amqp.Connection, message: string | ArrayBuffer | { valueOf(): ArrayBuffer | SharedArrayBuffer; }) {
    try {
        const channel = await connection.createChannel();
        const exchange = 'placedOrder';

        await channel.assertExchange(exchange, 'direct', { durable: true });

        const q = await channel.assertQueue('orderPlacedDeliveryQueue', { exclusive: true });

        await channel.bindQueue(q.queue, exchange, '');

        channel.consume(q.queue, (msg) => {
            console.log(`Received Message for que "placedOrder:" ${msg}`);
            const messageContent = JSON.parse(msg.content.toString());
            manageOrder(messageContent);

        },{noAck:true});

    } catch (error) {
        console.error("Error sending message:", error);
    }
}

async function subscribeTo
//############################################################################OLD CODE#############################################################
//////////////////////////////////////ReceivedOrderInformation endpoint//////////////////////////////////////////////
app.post<string, any, any, ReceivedOrderInformation>("/orderInformation", async (req, res) => {
    const receivedInformation = req.body;
    await checkForSmokingBreak();
    console.log("Delivery: The delivery person is back from the smoking break!" + receivedInformation.order);

    const checkedMessageBodyResult = checkRequestBodyOrderInformation(receivedInformation)
    if (checkedMessageBodyResult.hasError) {
        res.status(404).send(checkedMessageBodyResult.errorMessage)
    }
    else {
        manageOrder(receivedInformation);
        res.status(200).send(checkedMessageBodyResult.errorMessage)
    }
})
//////////////////////////////////////ReceivedOrderInformation endpoint//////////////////////////////////////////////

//////////////////////////////////////preparedNotification endpoint//////////////////////////////////////////////////
app.post<string, any, any, PreparedFood>("/preparedNotification", async (req, res) => {
    const preparedFood = req.body;
    await checkForSmokingBreak(false);
    const checkedMessageBodyResult = checkRequestBodyPreparedNotification(preparedFood)
    const foundOrder = await findOrder(preparedFood);

    if (checkedMessageBodyResult.hasError) {
        res.status(404).send(checkedMessageBodyResult.errorMessage);
    }
    else if (!foundOrder) {
        res.status(404).send(`The prepared meal ${preparedFood.food} does not exist on the order with the id ${preparedFood.order}`);
    }
    else {
        res.status(200).send(checkedMessageBodyResult.errorMessage);
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//////////////////////////////////////preparedNotification endpoint//////////////////////////////////////////////////

//////////////////////////////////////Helper methods/////////////////////////////////////////////////////////////////
function checkRequestBodyOrderInformation(receivedBody: ReceivedOrderInformation) {
    if (!receivedBody.guest) {
        return { hasError: true, errorMessage: "Error: Guest number is missing!" };
    }
    else if (!receivedBody.order) {
        return { hasError: true, errorMessage: "Error: Order number is missing!" };
    }
    else if (
        (receivedBody.food.length === 0 &&
            receivedBody.drinks.length === 0) ||
        !receivedBody.food ||
        !receivedBody.drinks

    ) {
        return { hasError: true, errorMessage: "Error: The send order does not contain any drink or food or one of the fields is missing!" }

    }
    else {
        return { hasError: false, errorMessage: "Success:The information have been send!" }
    }
}

function checkRequestBodyPreparedNotification(receivedBody: PreparedFood) {
    if (!receivedBody.food) {
        return { hasError: true, errorMessage: "Error: Received body does not have the required field food!" }
    }
    else if (!receivedBody.order) {
        return { hasError: true, errorMessage: "Error: Received body does not have the required field order!" }
    }
    else {
        return { hasError: false, errorMessage: "Success: The notification has been send successfully!" };
    }
}

let waitingTime = 0;
let smokeBreak: NodeJS.Timeout;
async function checkForSmokingBreak(fromTableService: boolean = true) {
    const randomNumber = Math.random();
    const chanceForSlowDelivery = parseFloat(process.env.SLOW_DELIVERY) || 0.1
    if (randomNumber < chanceForSlowDelivery) {
        if (waitingTime === 0 && fromTableService) {
            console.log("Delivery: Sorry, the Assistant Manager are doing a tactical smoking break!");
            waitingTime = parseInt(process.env.SLOW_DELIVERY_DELAY) || 3000;
            smokeBreak = setInterval(() => {
                waitingTime -= 10;
                if (waitingTime === 0) {
                    clearInterval(smokeBreak);
                }
            }, 10)
        }
    }
    return new Promise((resolve) => setTimeout(resolve, waitingTime))
}
//////////////////////////////////////Helper methods/////////////////////////////////////////////////////////////////