import { Console } from "console";
import fetch from "node-fetch";
import { Order } from "./types";
import amqp, { connect } from "amqplib";

let orderNumber = 1;
let request_id = 1;
const averageWaitingTimePerGuest = 4;
const forgetfulnessThreshold =
  parseFloat(process.env.FORGETTABLE_WAITER_RATIO) || 0.1;

export async function processOrder(order: Order) {
  const connection = await connectToRabbitMq();
  await sendPlacedOrder(connection, order);

  const highestOrderPosition = await sendFoodToFoodPreparation(order);
  await sendOrderToDelivery(order);
  const waitingTime = calculateWaitingTime(highestOrderPosition);

  return { waitingTime, order: orderNumber - 1 };
}

async function sendOrderToDelivery(order: Order) {
  const sentOrder = {
    guest: order.guest,
    food: order.food,
    drinks: order.drinks || [],
    order: orderNumber,
  };
  orderNumber++;
  fetch("http://Delivery:8084/orderInformation", {
    method: "POST",
    body: JSON.stringify(sentOrder),
    headers: { "Content-Type": "application/json" },
  });
}

async function sendFoodToFoodPreparation(order: Order) {
  const foodOrder = order.food;

  if (!foodOrder?.length) {
    console.log("ONLY DRINKS WERE ORDERED");
    // waiting time should be 0
    return 0;
  }

  let highestOrderPosition = 0;
  const iForgot = Math.random();
  let requestCount = 1;
  if (iForgot <= forgetfulnessThreshold) {
    requestCount = 2;
    console.log("Duplicated order is being sent");
  }
  while (requestCount > 0) {
    for (const foodId of foodOrder) {
      const response = await fetch("http://FoodPreparation:8085/orderItem", {
        method: "POST",
        body: JSON.stringify({ id: foodId, order: orderNumber, request_id }),
        headers: { "Content-Type": "application/json" },
      });
      const orderPosition = await response.json();
      if (orderPosition > highestOrderPosition) {
        highestOrderPosition = orderPosition;
      }
      request_id++;
    }
    if (requestCount === 2) {
      request_id = request_id - foodOrder.length;
    }
    requestCount--;
  }
  return highestOrderPosition;
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

    await channel.assertExchange(exchange, "direct", { durable: true });

    const routingKey = "newOrder";
    const eventBuffer = Buffer.from(JSON.stringify(order));
    channel.publish(exchange, routingKey, eventBuffer);

    setTimeout(function () {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
