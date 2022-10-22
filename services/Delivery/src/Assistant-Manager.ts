import { GuestWithOrder } from './interfaces';
import fetch from "node-fetch";
import { resolve } from 'path';
let deliveryId = 0;

export default class AssistantManager {
    isDelivering = false;
    async sendOrderItems(delivery: GuestWithOrder) {
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

        this.isDelivering = true;
        await this.delay();
        //TODO:This needs to be uncommented => Testing purpose
        /*         await fetch(url.href, {
                    method: 'POST',
                    body: JSON.stringify(deliveryBody),
                    headers: { 'Content-Type': 'application/json' }
                }) */
        await this.registerDeliveryForBilling(delivery);
        this.isDelivering = false;
    }

    async registerDeliveryForBilling(delivery: GuestWithOrder) {
        const originUrl = process.env.API_BILLING || "Billing:8083";
        const url = new URL(`${originUrl}/registerDelivery`);

        const deliveryBody = {
            guest: delivery.guest,
            food: delivery.Order.food,
            drinks: delivery.Order.drinks
        }
        //TODO:This needs to be uncommented => Testing purpose
        /*         await fetch(url.href, {
                    method: 'POST',
                    body: JSON.stringify(deliveryBody),
                    headers: { 'Content-Type': 'application/json' }
                }) */
    }

    //Helper function for testing!
    async delay() {
        console.log("In the delay");

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve;
            }, 10000)
        })
    }
}


//IDEA: Making the Manager as a class
//Only allow to innitialze three objects of this class
//Alway when this class is a ressource is blocked