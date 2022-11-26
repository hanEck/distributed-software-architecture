import { Console } from "console";
import fetch from "node-fetch";
import { Order } from "./types";

let orderNumber = 1;
let request_id = 1;
const averageWaitingTimePerGuest = 4;
const forgetfulnessThreshold =
  parseFloat(process.env.FORGETTABLE_WAITER_RATIO) || 0.1;

export async function processOrder(order: Order) {
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
      console.log("THIS IS THE ORDER ID:" + request_id);
    }
    requestCount--;
  }
  request_id++;
  return highestOrderPosition;
}

function calculateWaitingTime(highestOrderPosition: number) {
  let waitingTime = highestOrderPosition * averageWaitingTimePerGuest;
  return waitingTime;
}
