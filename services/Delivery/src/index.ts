import express = require("express");
import bodyParser = require("body-parser");
import { PreparedFood, ReceivedOrderInformation } from './interfaces'
import { manageOrder, findOrder } from './Delivery'

const port = parseInt(process.env.PORT, 10) || 3000;

const app = express();
app.use((req, res, next) => {
    bodyParser.json()(req, res, err => {
        if (err) {
            return res.status(400).send(`The send body is not a valid JS object!`)
        }
        next();
    })
});

//////////////////////////////////////ReceivedOrderInformation endpoint//////////////////////////////////////////////
app.post<string, any, any, ReceivedOrderInformation>("/orderInformation", (req, res) => {
    const receivedInformation = req.body;
    const hasError = checkRequestBodyOrderInformation(receivedInformation)
    if (hasError[0]) {
        console.log("hasError")
        res.status(404).send(hasError[1])
    }
    else {
        console.log("noError")
        manageOrder(receivedInformation);
        res.status(200).send(hasError[1])
    }
})

//////////////////////////////////////ReceivedOrderInformation endpoint//////////////////////////////////////////////

//////////////////////////////////////preparedNotification endpoint/////////////////////////////////////////////
app.post<string, any, any, PreparedFood>("/preparedNotification", async (req, res) => {
    const preparedFood = req.body;
    const hasError = checkRequestBodyPreparedNotification(preparedFood)
    const foundOrder = await findOrder(preparedFood);

    if (hasError[0]) {
        res.status(404).send(hasError[1]);
    }
    else if (!foundOrder) {
        res.status(404).send(`The prepared meal ${preparedFood.food} does not exist on the order with the id ${preparedFood.order}`);
    }
    else {
        res.status(200).send(hasError[1]);
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
//////////////////////////////////////preparedNotification endpoint/////////////////////////////////////////////

//////////////////////////////////////Helper methods////////////////////////////////////////////////////////////
function checkRequestBodyOrderInformation(receivedBody: ReceivedOrderInformation) {
    if (!receivedBody.guest) {
        return [true, "Error: Guest number is missing!"];
    }
    else if (!receivedBody.order) {
        return [true, "Error: Order number is missing!"];
    }
    else if (
        (receivedBody.food.length === 0 &&
            receivedBody.drinks.length === 0) ||
        !receivedBody.food ||
        !receivedBody.drinks

    ) {
        return [true, "Error: The send order does not contain any drink or food or one of the fields is missing!"]

    }
    else {
        return [false, "Success:The information have been send!"]
    }
}

function checkRequestBodyPreparedNotification(receivedBody: PreparedFood) {
    if (!receivedBody.food) {
        return [true, "Error: Received body does not have the required field food!"]
    }
    else if (!receivedBody.order) {
        return [true, "Error: Received body does not have the required field order!"]
    }
    else {
        return [false, "Success: The notification has been send successfully!"];
    }
}
//////////////////////////////////////Helper methods////////////////////////////////////////////////////////////