import { connect, Connection, ConsumeMessage } from "amqplib";
import { log } from "util";

export class RabbitMQ {
	connection: Connection;

	constructor() {
	}

	async connectToRabbitMq() {
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

	async receiveMessage(queueName: string, callback: (data: ConsumeMessage | null) => void) {
		if (!this.connection) {
			this.connection = await this.connectToRabbitMq();
		}

		const channel = await this.connection.createChannel();

		await channel.assertQueue(queueName, {
			durable: true
		});

		await channel.consume(queueName, callback);
	}
}
