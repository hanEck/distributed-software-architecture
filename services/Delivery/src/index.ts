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

//////////////////////////////////////deliveryInformation endpoint//////////////////////////////////////////////
interface GuestDelivery {
    guest: number,
    deliveries: Delivery[]
}
interface Delivery {
    delivery: number,
    food: number[],
    drink: number[]
}
interface DeliveryAndDrinksInformation {
    guest: number;
    food: number[];
    drink: number[];
}


const guestDeliveries: GuestDelivery[] = [];

let information: DeliveryAndDrinksInformation;
app.post("/deliveryInformation", (req, res) => {
    const receivedInformation = req.body;
    const guestDelivery: GuestDelivery = createNewGuestWithDelivery(receivedInformation);

    //TODO: Change this URL, when deploying it
    const originUrl = "http://localhost:5000";
    const urlParams = {
        guest: guestDelivery.guest,
        delivery: guestDelivery.deliveries[0].delivery
    }

    const drinksDelivery = {
        guest: guestDelivery.guest,
        food: [] as number[],
        drinks: guestDelivery.deliveries[0].drink
    }
    const url = new URL(`${originUrl}/guest/${urlParams.guest}/deliveries/${urlParams.delivery}`)

    fetch(url.href, {
        method: 'POST',
        body: JSON.stringify(drinksDelivery),
        headers: { 'Content-Type': 'application/json' }
    })
    res.send({ message: "Information was send successfully!" })
})

//TODO: This double find method on array can be simpliefied, by handing an method into the find method
//See the prime number example in the find() Documentation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find?retiredLocale=de

function addDelivery(deliveryInformation: DeliveryAndDrinksInformation) {
    let addedDelivery: GuestDelivery;
    if (guestDeliveries.find(order => order.guest === deliveryInformation.guest)) {
        addedDelivery = addDeliveryToGuest(deliveryInformation)
    }
    else {
        addedDelivery = createNewGuestWithDelivery(deliveryInformation);
    }
}

function createNewGuestWithDelivery(deliveryInformation: DeliveryAndDrinksInformation) {
    const guestDelivery: GuestDelivery = {
        guest: deliveryInformation.guest,
        deliveries: [{
            delivery: 1,
            food: deliveryInformation.food,
            drink: deliveryInformation.drink
        }]
    }
    guestDeliveries.push(guestDelivery);
    return guestDelivery;
}

//BUG:This does not work right now, because the whole array is expected and not a single Item
function addDeliveryToGuest(deliveryInformation: DeliveryAndDrinksInformation) {
    let deliveryItem;
    guestDeliveries.forEach((element) => {
        if (element.guest === deliveryInformation.guest) {
            deliveryItem = {
                delivery: +element.deliveries.length,
                food: deliveryInformation.food,
                drink: deliveryInformation.drink
            }
            element.deliveries.push(deliveryItem);
        }
    }
    )
    return { guest: deliveryInformation.guest, deliverydeliveryItem };
}
//////////////////////////////////////deliveryInformation endpoint//////////////////////////////////////////////

//////////////////////////////////////preparedNotification endpoint/////////////////////////////////////////////
interface PreparedFood {
    guest: number,
    food: number
}
app.post("/preparedNotification", (req, res) => {
    const preparedFood: PreparedFood = req.body;
    res.send({ message: "Notification was send successfully!" })
    console.log(preparedFood);
})


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


//////////////////////////////////////preparedNotification endpoint/////////////////////////////////////////////