let orderNumber = 0;

export async function order(req: { json: () => any; }){
    const order = req.json();
    const highestOrder = await getFood(order);
    return calculateWaitingTime(highestOrder);

}

async function sendOrderToDelivery(order: { guest?: number; food: any; drink?: number[]; }){
    orderNumber++;
    fetch("Delivery:8084/orderInformation", {
        method: "POST",
        body: JSON.stringify({order, orderNumber}),
        headers: {"Content-Type" : "application/json"}
    });
}

async function getFood(order: { guest?: number; food: any; drink?: number[]; }){
    //send food order to food preparation
    const foodOrder = await order.food;
    let highestOrder = 0;

    foodOrder.forEach((element: any) => {
        fetch("FoodPreparation:8085/orderItem", {
            method: "POST",
            body: JSON.stringify({id: element}),
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





