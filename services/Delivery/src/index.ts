import express = require("express");
import bodyParser = require("body-parser");
import fetch from 'node-fetch';

const port = parseInt(process.env.PORT, 10) || 3000;
const myTargetConfiguration = process.env.MY_TARGET_CONFIGURATION || "http://google.com";

const app = express();
app.use(bodyParser.json());

//////////////////////////////////////Template Code/////////////////////////////////////////////////////////////
interface PersonRequestBody { }
type Persons = string[];
app.get<any, Persons, PersonRequestBody>("/persons", (req, res) => {
    res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
});

interface ConfigurationRequestBody { }
type Configuration = string;
app.get<any, Configuration, ConfigurationRequestBody>("/configuration", (req, res) => {
    res.send(myTargetConfiguration);
});

interface OutgoingRequestRequestBody { }
type OutgoingRequestResponse = string;
app.get<any, OutgoingRequestResponse, OutgoingRequestRequestBody>("/outgoingRequest", (req, res) => {
    fetch(myTargetConfiguration)
        .then(res => res.text())
        .then(text => {
            res.send(text);
        })
        .catch(err => {
            console.log(err);
        });
});
//////////////////////////////////////Template Code/////////////////////////////////////////////////////////////

//////////////////////////////////////OrderInformation endpoint//////////////////////////////////////////////

//TODO:The relationship of orders and deliveries must be rethought
//Can one order have multiple Orders? => e.g. drink Order + first food + second food
//Furthermore it needs to be defined if it makes sense to save the orders (instead of deliveries) or both?
//Right now orders and deliveries are used as synonyms (a Order turns into an order when a part is send)

//TODO:Reconstruct the structure of the App, regarding to turningOrder into order

interface GuestWithOrders {
    guest: number,
    orders: Order[]
}
interface GuestWithOrder {
    guest: number,
    Order: Order
}

interface Order {
    Order: number,
    food: number[],
    drinks: number[]
}
interface OrderAndDrinksInformation {
    guest: number;
    food: number[];
    drinks: number[];
}

const guestOrders: GuestWithOrders[] = [];

app.post("/orderInformation", (req, res) => {
    const receivedInformation: OrderAndDrinksInformation = req.body;
    const guestOrder: GuestWithOrder = addOrder(receivedInformation);

    //TODO: Change this URL, when deploying it
    const originUrl = "http://localhost:5000";
    const urlParams = {
        guest: guestOrder.guest,
        Order: guestOrder.Order
    }

    const drinksOrder = {
        guest: guestOrder.guest,
        food: [] as number[],
        drinks: guestOrder.Order.drinks
    }
    const url = new URL(`${originUrl}/guest/${urlParams.guest}/deliveries/${urlParams.Order}`)

    fetch("https://webhook.site/232c4d8e-6f3a-438c-898e-65d1821b41f0", {
        method: 'POST',
        body: JSON.stringify(drinksOrder),
        headers: { 'Content-Type': 'application/json' }
    })
    res.send({ message: "Information was send successfully!" })
    console.log(guestOrders);
})

//TODO: This double find method on array can be simpliefied, by handing an method into the find method
//See the prime number example in the find() Documentation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find?retiredLocale=de

function addOrder(OrderInformation: OrderAndDrinksInformation): GuestWithOrder {
    let addedOrder: GuestWithOrder;
    if (guestOrders.find(order => order.guest === OrderInformation.guest)) {
        addedOrder = addOrderToGuest(OrderInformation)
    }
    else {
        addedOrder = createNewGuestWithOrder(OrderInformation);
    }
    return addedOrder;
}

function createNewGuestWithOrder(OrderInformation: OrderAndDrinksInformation): GuestWithOrder {
    const guestOrder: GuestWithOrders = {
        guest: OrderInformation.guest,
        orders: [{
            Order: 1,
            food: OrderInformation.food,
            drinks: OrderInformation.drinks
        }]
    }
    guestOrders.push(guestOrder);
    return { guest: guestOrder.guest, Order: guestOrder.orders[0] };
}

function addOrderToGuest(OrderInformation: OrderAndDrinksInformation): GuestWithOrder {
    let OrderItem;
    guestOrders.forEach((element) => {
        if (element.guest === OrderInformation.guest) {
            OrderItem = {
                Order: +element.orders.length,
                food: OrderInformation.food,
                drinks: OrderInformation.drinks
            }
            element.orders.push(OrderItem);
        }
    }
    )
    return { guest: OrderInformation.guest, Order: OrderItem };
}
//////////////////////////////////////OrderInformation endpoint//////////////////////////////////////////////

//////////////////////////////////////preparedNotification endpoint/////////////////////////////////////////////
interface PreparedFood {
    guest: number,
    food: number
}
app.post("/preparedNotification", (req, res) => {
    const preparedFood: PreparedFood = req.body;
    res.send({ message: "Notification was send successfully!" })
    console.log(preparedFood);

    //if a meal is prepared, take it and send it to the customer
})


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


//////////////////////////////////////preparedNotification endpoint/////////////////////////////////////////////