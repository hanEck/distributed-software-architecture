import fetch from "node-fetch";

let orderNumber = 1;

export async function processOrder(order: any){
    const highestOrder = await getFood(order);
    await sendOrderToDelivery(order);
    const waitingTime = calculateWaitingTime(highestOrder);

    return { waitingTime, order: orderNumber - 1 }
}

async function sendOrderToDelivery(order: any){
    const sentOrder = {
        guest: order.guest, 
        food: order.food, 
        drinks: order.drinks || [], 
        order: orderNumber
    };
    fetch("http://Delivery:8084/orderInformation", {
        method: "POST",
        body: JSON.stringify(sentOrder),
        headers: {"Content-Type" : "application/json"}
    });
    orderNumber++;
}

async function getFood(order: { guest?: number; food: any; drink: number[]; }){
    //send food order to food preparation
    const foodOrder = await order.food;
    let highestOrder = 0;

    foodOrder.forEach((element: any) => {
        fetch("http://FoodPreparation:8085/orderItem", {
            method: "POST",
            body: JSON.stringify({id: element, order: orderNumber}),
            headers: {"Content-Type" : "application/json"}
        })
        .then(async (response) => {
            const orderPosition = await response.json();
            if(orderPosition > highestOrder){
                highestOrder = orderPosition;
            }
        });
    });
    return highestOrder;
}

function calculateWaitingTime(highestOrder: number){
    let waitingTime = highestOrder * 4;
    return waitingTime;
}





