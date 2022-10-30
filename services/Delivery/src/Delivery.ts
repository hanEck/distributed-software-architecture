import {
    GuestWithOrder,
    GuestWithOrders,
    PreparedFood,
    ReceivedOrderInformation
} from './interfaces'
import AssistantManager from './Assistant-Manager';

const guestOrders: GuestWithOrders[] = [];
const assistantManagers = [
    new AssistantManager(),
    new AssistantManager(),
    new AssistantManager()]
//////////////////////////////////////receivedOrderInformation endpoint///////////////////////////////////////////////
export async function manageOrder(receivedOrderInformation: ReceivedOrderInformation) {
    let addedOrder: GuestWithOrder;
    if (guestOrders.find(order => order.guest === receivedOrderInformation.guest)) {
        addedOrder = addOrderToGuest(receivedOrderInformation)
    }
    else {
        addedOrder = createNewGuestWithOrder(receivedOrderInformation);
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
    removeDrinksFromOrder(drinksOrder.Order.order);
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
}
//////////////////////////////////////receivedOrderInformation endpoint//////////////////////////////////////////////

//////////////////////////////////////preparedNotification endpoint/////////////////////////////////////////////
export async function findOrder(preparedFood: PreparedFood) {
    let foodOrder: GuestWithOrder;
    //Helper collection to find the processed item for removal
    let itemIndices: number[] = [];
    guestOrders.forEach((guest, indexGuest) => {
        guest.orders.find((order, indexOrder) => {
            if (order.order === preparedFood.order) {
                itemIndices.push(indexGuest, indexOrder)
                order.food.forEach((meal, indexMeal) => {
                    if (meal === preparedFood.food) {
                        itemIndices.push(indexMeal);
                        foodOrder = {
                            guest: guest.guest,
                            Order: {
                                order: order.order,
                                food: [meal],
                                drinks: [] as number[]
                            }
                        }
                    }
                })
            }
        });
    })
    if (foodOrder) {
        const availableManager = await getAvailableManager();
        await availableManager.sendOrderItems(foodOrder);
        removeDeliverdFood(itemIndices);
        return foodOrder;
    }

    return foodOrder;
}

function removeDrinksFromOrder(orderNumber: number) {
    guestOrders.forEach((guest) => {
        guest.orders.find((order) => {
            if (order.order === orderNumber) {
                order.drinks = [] as number[]
            }
        })
    })
}

//Method will remove specific food item
//Furthermore the collections the item is included in (order/guest) will also get
//removed when they are empty
function removeDeliverdFood(indices: number[]) {
    guestOrders[indices[0]].orders[indices[1]].food.splice(indices[2], 1);
    if (guestOrders[indices[0]].orders[indices[1]].food.length === 0) {
        guestOrders[indices[0]].orders.splice(indices[1], 1);
        if (guestOrders[indices[0]].orders.length === 0) {
            guestOrders.splice(indices[0], 1)
        }
    }
}
//////////////////////////////////////preparedNotification endpoint/////////////////////////////////////////////

/////////////////////////////////////Helper methods/////////////////////////////////////////////////////////////////////
//The loop within this Method iterates until a manager is available (manuel stop)
async function getAvailableManager(): Promise<AssistantManager> {
    const keepLooping = true;
    let checkingResult;

    while (keepLooping) {
        checkingResult = await checkForManager();
        if (checkingResult) {
            break;
        }
    }
    return checkingResult;
}

//Method checks if there is a manager availbale and if not calls a delay followed by returning an undefined
async function checkForManager() {
    for (let assistantManager of assistantManagers) {
        if (!assistantManager.isDelivering) {
            return assistantManager
        }
    }
    await delayFoManagerAssignment()
    return undefined
}

//Sets delay to keep time between each while loop in the outer function
function delayFoManagerAssignment() {
    return new Promise((resolve) => { setTimeout(resolve, 1000); })
}
/////////////////////////////////////Generic methods//////////////////////////////////////////////////////////////////


