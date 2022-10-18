import express = require("express");
import FoodPreparation from "./FoodPreperation";

const port = parseInt(process.env.PORT, 10) || 3000;

const app = express();

const foodPreparation = new FoodPreparation();
app.get("/meals", (req,res) => {
    res.json(foodPreparation.getCookableMeals())
});

app.post("/orderItem", (req,res) => {
    res.send(foodPreparation.takeOrder(req.body));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});