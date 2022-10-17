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
interface GuestWithDeliveries {
    guest: number,
    deliveries: Delivery[]
}
interface GuestWithDelivery {
    guest: number,
    delivery: Delivery
}

interface Delivery {
    delivery: number,
    food: number[],
    drinks: number[]
}
interface DeliveryAndDrinksInformation {
    guest: number;
    food: number[];
    drinks: number[];
}

const guestDeliveries: GuestWithDeliveries[] = [];

app.post("/deliveryInformation", (req, res) => {
    const receivedInformation: DeliveryAndDrinksInformation = req.body;
    const guestDelivery: GuestWithDelivery = addDelivery(receivedInformation);

    //TODO: Change this URL, when deploying it
    const originUrl = "http://localhost:5000";
    const urlParams = {
        guest: guestDelivery.guest,
        delivery: guestDelivery.delivery
    }

    const drinksDelivery = {
        guest: guestDelivery.guest,
        food: [] as number[],
        drinks: guestDelivery.delivery.drinks
    }
    const url = new URL(`${originUrl}/guest/${urlParams.guest}/deliveries/${urlParams.delivery}`)

    fetch("https://webhook.site/232c4d8e-6f3a-438c-898e-65d1821b41f0", {
        method: 'POST',
        body: JSON.stringify(drinksDelivery),
        headers: { 'Content-Type': 'application/json' }
    })
    res.send({ message: "Information was send successfully!" })
})

//TODO: This double find method on array can be simpliefied, by handing an method into the find method
//See the prime number example in the find() Documentation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find?retiredLocale=de

function addDelivery(deliveryInformation: DeliveryAndDrinksInformation): GuestWithDelivery {
    let addedDelivery: GuestWithDelivery;
    if (guestDeliveries.find(order => order.guest === deliveryInformation.guest)) {
        addedDelivery = addDeliveryToGuest(deliveryInformation)
    }
    else {
        addedDelivery = createNewGuestWithDelivery(deliveryInformation);
    }
    return addedDelivery;
}

function createNewGuestWithDelivery(deliveryInformation: DeliveryAndDrinksInformation): GuestWithDelivery {
    const guestDelivery: GuestWithDeliveries = {
        guest: deliveryInformation.guest,
        deliveries: [{
            delivery: 1,
            food: deliveryInformation.food,
            drinks: deliveryInformation.drinks
        }]
    }
    guestDeliveries.push(guestDelivery);
    return { guest: guestDelivery.guest, delivery: guestDelivery.deliveries[0] };
}

function addDeliveryToGuest(deliveryInformation: DeliveryAndDrinksInformation): GuestWithDelivery {
    let deliveryItem;
    guestDeliveries.forEach((element) => {
        if (element.guest === deliveryInformation.guest) {
            deliveryItem = {
                delivery: +element.deliveries.length,
                food: deliveryInformation.food,
                drinks: deliveryInformation.drinks
            }
            element.deliveries.push(deliveryItem);
        }
    }
    )
    return { guest: deliveryInformation.guest, delivery: deliveryItem };
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