import amqp, { connect } from "amqplib";

export class MessagingHandler {
    static rabbitMQConnection = await connect({
        hostname: "RabbitMQ",
        port: 5672,
        username: process.env.RABBITMQ_DEFAULT_USER || "admin",
        password: process.env.RABBITMQ_DEFAULT_PASS || "admin1234"
    });

}