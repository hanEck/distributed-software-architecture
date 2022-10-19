import express = require("express");
import FoodPreparation from "./FoodPreperation";

const port = parseInt(process.env.PORT, 10) || 3000;
const app = express();
app.use(express.json());

const foodPreparation = new FoodPreparation();

app.get("/meals", (req,res) => {
    res.status(200);
    res.json(foodPreparation.getCookableMeals())
});

app.post("/orderItem", (req,res) => {
    res.status(200).send(foodPreparation.takeOrder(req.body.id)+"");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});