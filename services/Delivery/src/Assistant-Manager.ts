import { GuestWithOrder } from './interfaces';
import fetch from "node-fetch";

let deliveryId = 0;

export default class AssistantManager {
    isDelivering = false;
    async sendOrderItems(delivery: GuestWithOrder) {
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
        })

        await this.registerDeliveryForBilling(delivery, deliveryBody.delivery);
        this.isDelivering = false;
    }

    async registerDeliveryForBilling(delivery: GuestWithOrder, deliveryId: number) {
        const originUrl = process.env.API_BILLING || "Billing:8083";
        const urlParams = {
            guest: delivery.guest,
        }
        const url = new URL(`${originUrl}/registerDelivery/${urlParams.guest}`);

        const deliveryBody = {
            guest: delivery.guest,
            food: delivery.Order.food,
            drinks: delivery.Order.drinks,
            order: delivery.Order.order
        }
        await this.fetchBilling(url, deliveryBody, deliveryId)
    }

    async fetchBilling(url: URL, deliveryBody: any, deliveryId: number) {
        const retryTimes = this.getFibonacciSequence(10).map(number => number * 1000);  //Fibonacci based daly time
        let i = 0;
        let keepInterating = true;
        while (keepInterating) {
            await fetch(url.href, {
                method: 'POST',
                body: JSON.stringify(deliveryBody),
                headers: { 'Content-Type': 'application/json', 'deliveryId': deliveryId.toString() }
            }).then(async (response) => {
                if (response.status >= 500 && response.status <= 599) {  //Check for error code in the 500 range
                    await this.delayForRetry(retryTimes[i])
                    i++
                }
                else {
                    keepInterating = false
                }
            }
            ).catch(() => {
                console.log("Error: An issue occured by sending delivery to billing!");
                keepInterating = false  //Avoid infinite loop in case of catch
            })
            if (i >= 10) {  //End loop interation if all 5 retry attemps fails
                keepInterating = false;
                console.log("Retry for Billing failed! Message was not send successfully");
            }
        }
    }
    getFibonacciSequence(sequLength: number) {
        var i;
        var fib = [0, 1]
        if (sequLength < 3) {
            return fib.slice(0, sequLength)
        }
        else {
            for (i = 2; i <= (sequLength - 1); i++) {
                fib.push(fib[i - 2] + fib[i - 1]);
            }
            return fib;
        }
    }

    delayForRetry(delay: number) {
        return new Promise((resolve) => { setTimeout(resolve, delay); })
    }


}
//TODO: Add variable is reserved also to the messaging for billing
// fetching is now outsorced and will be done for three times, but never longer than one minute