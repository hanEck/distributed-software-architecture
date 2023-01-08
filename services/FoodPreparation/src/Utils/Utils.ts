import amqp, { connect } from "amqplib";

export function delay(time: number) {
    return (new Promise((resolve) => {
        setTimeout(resolve,time);
    }))
}

export async function connectToRabbitMq() {
	try {
		const connection = await connect({
			hostname: "RabbitMQ",
			port: 5672,
			username: process.env.RABBITMQ_DEFAULT_USER || "admin",
			password: process.env.RABBITMQ_DEFAULT_PASS || "admin1234"
		});
		console.log("Successfully connected to RabbitMQ");
		return connection;
	} catch (error) {
		console.error("Error connecting to RabbitMQ:", error);
	}
}

export async function sendMessage(connection: amqp.Connection, message: string | ArrayBuffer | {valueOf(): ArrayBuffer | SharedArrayBuffer;}) {
	try {
		const channel = await connection.createChannel();
		const exchange = "my-exchange";
		const routingKey = "my-routing-key";

		await channel.assertExchange(exchange, "direct", { durable: true });
		// @ts-ignore
		channel.publish(exchange, routingKey, Buffer.from(message));

		console.log(`Sent message: ${message}`);
	} catch (error) {
		console.error("Error sending message:", error);
	}
}