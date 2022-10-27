import express = require("express");
import bodyParser = require("body-parser");
import { PreparedFood, ReceivedOrderInformation } from './interfaces'
import { addOrder, findOrder } from './Delivery'

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
app.post("/orderInformation", (req, res) => {
    try {
        const receivedInformation: ReceivedOrderInformation = req.body;

        addOrder(receivedInformation);

        res.send({ message: "Information was send successfully!" })
    }
    catch (e) {
        res.status(400);
    }
})

//////////////////////////////////////ReceivedOrderInformation endpoint//////////////////////////////////////////////

//////////////////////////////////////preparedNotification endpoint/////////////////////////////////////////////

app.post("/preparedNotification", (req, res) => {
    const preparedFood: PreparedFood = req.body;
    const foundOrder = findOrder(preparedFood);

    if (foundOrder) {
        res.status(200).send("Notification was send successfully!")
    }
    else {
        res.status(404).send(
            `The prepared meal with the id ${preparedFood.food} does not exist within the order with the id ${preparedFood.order}`)
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

//////////////////////////////////////preparedNotification endpoint/////////////////////////////////////////////

//TODO: Handle Error within these two endpoints
//oderInformation => Check if all neccessary fields were send 
//guest and order id and no empty items condition

//prepareNotification => Check if given order with food exists