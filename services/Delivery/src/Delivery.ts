import {
    GuestWithOrder,
    GuestWithOrders,
    Order,
    PreparedFood,
    ReceivedOrderInformation
} from './interfaces'

import { sendOrderItems } from './Assistant-Manager';

//////////////////////////////////////Dummy Data//////////////////////////////////////////////////////////////////////
const order1: Order = {
    order: 1,
    food: [1, 2, 3],
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
//////////////////////////////////////Dummy Data//////////////////////////////////////////////////////////////////////

//////////////////////////////////////ReceivedOrderInformation endpoint//////////////////////////////////////////////
export function addOrder(ReceivedOrderInformation: ReceivedOrderInformation) {
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
    sendOrderItems(drinksOrder);
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
export function findOrder(preparedFood: PreparedFood) {
    let foodOrder: GuestWithOrder;
    guestOrders.forEach((guest) => {
        const orderResult = guest.orders.find((order) => {
            if (order.order === preparedFood.order) {
                const mealResult = order.food.find(meal => meal === preparedFood.food)
                if (mealResult) {
                    foodOrder = {
                        guest: guest.guest,
                        Order: {
                            order: order.order,
                            food: [mealResult],
                            drinks: [] as number[]
                        }
                    }
                }
            }
        });
    })
    sendOrderItems(foodOrder);
    return foodOrder;
}
//////////////////////////////////////Prepare notification endpoint///////////////////////////////////////////////////