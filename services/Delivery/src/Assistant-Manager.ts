import { GuestWithOrder } from './interfaces';
let deliveryId = 0;

export function sendOrderItems(order: GuestWithOrder) {
    const originUrl = "http://localhost:5000";
    const urlParams = {
        guest: order.guest,
        order: order.Order.order
    }
    const url = new URL(`${originUrl}/guest/${urlParams.guest}/deliveries/${urlParams.order}`)

    const deliveryBody = {
        delivery: ++deliveryId,
        food: order.Order.food,
        drinks:order.Order.drinks
    }
    console.log(deliveryBody);

//TODO: Change this URL, when deploying it
 /*    fetch(url.href, {
        method: 'POST',
        body: JSON.stringify(order),
        headers: { 'Content-Type': 'application/json' }
    }) */
}