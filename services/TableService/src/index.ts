import express = require("express");
import { processOrder } from "./order";
import * as os from "os";


const port = parseInt(process.env.PORT, 10) || 3000;

const app = express();
app.use(express.json());

// service health check
app.get("/health", (req, res) => {
	const mem = os.freemem();
	const cpu = os.loadavg()[0];

	if (mem < 100000000 || cpu > 5) {
		console.warn("Table Service Service unhealthy");
		return res.status(500).send({
			message: "Table Service Service is unhealthy"
		});
	}

	return res.send({
		message: "Table Service Service is healthy"
	});
});

app.post("/orders", async (req, res) => {
	const order = req.body;

	await processOrder(
		order,
		(responseData: {waitingTime: number; order: number}) => {
			res.json(responseData);
		}
	);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
