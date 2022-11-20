import express = require("express");
import {createMenu, getMenuItemPrices} from "./menu";
import { getPossibleDelay } from "./utils";

const port = parseInt(process.env.PORT, 10) || 3000;

const app = express();

app.get("/menu", async (req, res) => {
    const menu = await createMenu()
    res.json(menu);
});

app.get("/prices", async (req, res) => {
    await getPossibleDelay();
    const prices = await getMenuItemPrices()
    res.json(prices);
})

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});