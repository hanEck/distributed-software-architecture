import amqp, { connect } from "amqplib";
import { CookableMeal } from "../Types/types";

export default class RabbitMQ  {
    connection: amqp.Connection;
    constructor() {
        this.connectToRabbitMq();
    }
    async connectToRabbitMq() {
        try {
            this.connection = await connect({
                hostname: "RabbitMQ",
                port: 5672,
                username: process.env.RABBITMQ_DEFAULT_USER || "admin",
                password: process.env.RABBITMQ_DEFAULT_PASS || "admin1234"
            });
            console.log("Successfully connected to RabbitMQ");
        } catch (error) {
            console.error("Error connecting to RabbitMQ:", error);
        }
    }
    
    async sendMessage(queue: string, message: string | CookableMeal[] ) {
        try {
            if (!this.connection) { 
                await this.connectToRabbitMq();
            }
            const channel = await this.connection.createChannel();
            const routingKey = "my-routing-key";
    
            await channel.assertQueue(queue, { durable: true });
            // @ts-ignore
            channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
            console.log(`Sent message: ${message}`);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            // await this.connection.close();
        }
    }
    async consumeEvent(queue: string, callback: (msg: amqp.Message) => void) {
        try {
            if (!this.connection) { 
                await this.connectToRabbitMq();
            }
            const channel = await this.connection.createChannel();
            const exchange = "my-exchange";
            const routingKey = "my-routing-key";
            await channel.assertExchange(queue, "direct", { durable: true });
            channel.consume(queue, (msg: amqp.Message) => {
                if (msg !== null) {
                  console.log('Recieved:', JSON.parse(msg.content.toString()));
                  callback(msg);
                } else {
                  console.log('Consumer cancelled by server');
                }
              });
        } catch (error) {
            console.error("Error consuming message:", error);
        }
    }
  
}