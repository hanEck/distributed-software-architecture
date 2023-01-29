import { GuestWithOrder, Log, LOG_TYPE } from './interfaces';
import fetch from "node-fetch";
import amqp from "amqplib";

let deliveryId = 0;

export default class AssistantManager {
    isDelivering = false;
    async sendOrderItems(delivery: GuestWithOrder, connection: amqp.Connection) {
        const originUrl = process.env.API_CUSTOMER || "Customer:8080";
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

        await fetch(url.href, {
            method: 'POST',
            body: JSON.stringify(deliveryBody),
            headers: { 'Content-Type': 'application/json' }
        }).catch(() => {
            console.log("Error: An issue occured by sending delivery to customer!");
            console.log({
                type: LOG_TYPE.WARN,
                timestamp:Date.now(),
                serviceName: "Billing",
                event: {
                    method: "post /guest/:guest/deliveries/:order",
                    order: delivery.Order.order,
                    message: "Error: An issue occured by sending delivery to customer!"
                }
            } as Log);
        })

        await this.registerDeliveryForBilling(delivery, deliveryBody.delivery, connection);
        this.isDelivering = false;
    }

    async registerDeliveryForBilling(delivery: GuestWithOrder, deliveryId: number, connection: amqp.Connection) {
        const deliveryBody = {
            guest: delivery.guest,
            food: delivery.Order.food,
            drinks: delivery.Order.drinks,
            order: delivery.Order.order,
            deliveryId: deliveryId
        }
        await this.fetchBilling(deliveryBody, connection)
    }

    async fetchBilling(deliveryBody: any, connection: amqp.Connection) {

        const channel = await connection.createChannel();

        const queue = 'billDelivery';
        const message = JSON.stringify(deliveryBody);

        channel.assertQueue(queue, {
            durable: true
        });
        channel.sendToQueue(queue, Buffer.from(message));
        console.log({
            type: LOG_TYPE.INFO,
            timestamp:Date.now(),
            serviceName: "Billing",
            event: {
                method: "send message " + queue,
                message: "Sent Message to Queue: " + queue + " with message: " + message
            }
        } as Log);
    }
}
