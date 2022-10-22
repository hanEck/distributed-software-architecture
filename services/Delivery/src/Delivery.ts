import {
    GuestWithOrder,
    GuestWithOrders,
    Order,
    PreparedFood,
    ReceivedOrderInformation
} from './interfaces'

import AssistantManager from './Assistant-Manager';
import { resolve } from 'path';

//////////////////////////////////////Dummy Data//////////////////////////////////////////////////////////////////////
const order1: Order = {
    order: 1,
    food: [3],
    drinks: [1, 2, 2]
}
const order2: Order = {
    order: 2,
    food: [1, 2, 3],
    drinks: [1, 2, 2]
}
const order3: Order = {
    order: 3,
    food: [1, 2, 3],
    drinks: [1, 2, 2]
}
const guestOrders: GuestWithOrders[] = [
    {
        guest: 21,
        orders: [order1]

    },
    {
        guest: 32,
        orders: [order2, order3]
    }
];

const assistantManagers = [
    new AssistantManager(),
    new AssistantManager(),
    new AssistantManager()]
//////////////////////////////////////Dummy Data//////////////////////////////////////////////////////////////////////

//////////////////////////////////////ReceivedOrderInformation endpoint//////////////////////////////////////////////
export async function addOrder(ReceivedOrderInformation: ReceivedOrderInformation) {
    let addedOrder: GuestWithOrder;
    if (guestOrders.find(order => order.guest === ReceivedOrderInformation.guest)) {
        addedOrder = addOrderToGuest(ReceivedOrderInformation)
    }
    else {
        addedOrder = createNewGuestWithOrder(ReceivedOrderInformation);
    }
    const drinksOrder = {
        guest: addedOrder.guest,
        Order: {
            ...addedOrder.Order,
            food: [] as number[]
        }
    }
    const availableManager = await getAvailableManager();
    await availableManager.sendOrderItems(drinksOrder);
}

function createNewGuestWithOrder(orderInformation: ReceivedOrderInformation): GuestWithOrder {
    const guestOrder: GuestWithOrders = {
        guest: orderInformation.guest,
        orders: [{
            order: orderInformation.order,
            food: orderInformation.food,
            drinks: orderInformation.drinks
        }]
    }
    guestOrders.push(guestOrder);
    return { guest: guestOrder.guest, Order: guestOrder.orders[0] };
}

function addOrderToGuest(orderInformation: ReceivedOrderInformation): GuestWithOrder {
    let OrderItem;
    guestOrders.forEach((element) => {
        if (element.guest === orderInformation.guest) {
            OrderItem = {
                order: orderInformation.order,
                food: orderInformation.food,
                drinks: orderInformation.drinks
            }
            element.orders.push(OrderItem);
        }
    }
    )
    return { guest: orderInformation.guest, Order: OrderItem };
}//////////////////////////////////////ReceivedOrderInformation endpoint//////////////////////////////////////////////

//////////////////////////////////////Prepare notification endpoint///////////////////////////////////////////////////
export async function findOrder(preparedFood: PreparedFood) {
    let foodOrder: GuestWithOrder;
    //Helper collection to find the processed item for removal
    let itemIndices: number[] = [];
    guestOrders.forEach((guest, indexGuest) => {
        guest.orders.find((order, indexOrder) => {
            if (order.order === preparedFood.order) {
                itemIndices.push(indexGuest, indexOrder)
                const mealResult = order.food.find((meal, indexMeal) => {
                    if (meal === preparedFood.food) {
                        itemIndices.push(indexMeal);
                        foodOrder = {
                            guest: guest.guest,
                            Order: {
                                order: order.order,
                                food: [mealResult],
                                drinks: [] as number[]
                            }
                        }
                    }
                })
            }
        });
    })
    const availableManager = await getAvailableManager();
    await availableManager.sendOrderItems(foodOrder);
    removeDeliverdItem(itemIndices);
    return foodOrder;
}

//BUG: For now there is going to be a Bug if a new Order arrives befor elemnt is Removed
//Could be solved by initializing a class like style, so you would have multiple arrays
//For each delivery Processing
function removeDeliverdItem(indices: number[]) {
    guestOrders[indices[0]].orders[indices[1]].food.splice(indices[2], 1);

    //TODO: This is not working as expected and there is a logic needed to firstly get rid of orders!
    if (guestOrders[indices[0]].orders[indices[1]].food.length === 0) {
        console.log("In the guest deletion");
        const deletedItem = guestOrders.slice(indices[0], 1);
        console.log(deletedItem);
    }

}
//////////////////////////////////////Prepare notification endpoint///////////////////////////////////////////////////

/////////////////////////////////////Generic methods//*  *///////////////////////////////////////////////////////////////////
async function getAvailableManager(): Promise<AssistantManager> {
    for (let assistantManager of assistantManagers) {
        if (!assistantManager.isDelivering) {
            return assistantManager
        }
    }
    setTimeout(() => {
        getAvailableManager();
        resolve();
    }, 1000)
}

/////////////////////////////////////Generic methods//////////////////////////////////////////////////////////////////