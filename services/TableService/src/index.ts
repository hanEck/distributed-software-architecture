import express = require("express");
import { processOrder } from "./order";
import amqp, { connect } from "amqplib";

const port = parseInt(process.env.PORT, 10) || 3000;

const app = express();
app.use(express.json());

app.post("/orders", async (req, res) => {
  const order = req.body;

  res.json(await processOrder(order));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
