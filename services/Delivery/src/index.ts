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

interface DeliveryAndDrinksInformation {
    guest: number;
    food: number[];
    drinks: number[];
}
let information: DeliveryAndDrinksInformation;
app.post("/deliveryInformation", (req, res) => {
    information = req.body;

    //Creating the url based on post input
    const originUrl = "http://localhost:5000";
    const urlParams = {
        guest: information.guest,
        order: '1'
    }
    const url = new URL(`${originUrl}/guest/${urlParams.guest}/deliveries/${urlParams.order}`)

     fetch(url.href, {
        method: 'POST',
        body: JSON.stringify(information),
        headers: {'Content-Type': 'application/json'}
    })

    res.send({ message: "Information was send successfully!" })
})

interface PreparedFood{
    guest: number,
    food: number
}
app.post("/preparedNotification", (req,res)=>{
const preparedFood: PreparedFood= req.body;
res.send({ message: "Notification was send successfully!" })
console.log(preparedFood);
})


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

//Todo: Create callable endpoint which reseives deliveryInformation