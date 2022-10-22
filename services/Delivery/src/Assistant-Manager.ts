import { GuestWithOrder } from './interfaces';
import fetch from "node-fetch";
let deliveryId = 0;

export function sendOrderItems(delivery: GuestWithOrder) {
    const originUrl = process.env.API_CUSTOMER || "Customer:5000";
    const urlParams = {
        guest: delivery.guest,
        order: delivery.Order.order
    }

    const url = new URL(`${originUrl}/guest/${urlParams.guest}/deliveries/${urlParams.order}`)

    const deliveryBody = {
        delivery: ++deliveryId,
        food: delivery.Order.food,
        drinks: delivery.Order.drinks
    }

    //TODO:This needs to be uncommented => Testing purpose
    /*     fetch(url.href, {
            method: 'POST',
            body: JSON.stringify(deliveryBody),
            headers: { 'Content-Type': 'application/json' }
        }) */
}

export function registerDeliveryForBilling(delivery: GuestWithOrder) {
    const originUrl = process.env.API_BILLING || "Billing:8083";
    const url = new URL(`${originUrl}/registerDelivery`);

    const deliveryBody = {
        guest: delivery.guest,
        food: delivery.Order.food,
        drinks: delivery.Order.drinks
    }

    //TODO:This needs to be uncommented => Testing purpose
    /*     fetch(url.href, {
            method: 'POST',
            body: JSON.stringify(deliveryBody),
            headers: { 'Content-Type': 'application/json' }
        }) */

}