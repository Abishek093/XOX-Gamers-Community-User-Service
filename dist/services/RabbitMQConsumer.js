"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeQueue = void 0;
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
const rabbitmqUrl = `amqp://${process.env.RABBITMQ_HOST || 'localhost'}`;
const consumeQueue = (queueName, callback) => {
    callback_api_1.default.connect(rabbitmqUrl, (connectError, connection) => {
        if (connectError) {
            throw connectError;
        }
        connection.createChannel((channelError, channel) => {
            if (channelError) {
                throw channelError;
            }
            channel.assertQueue(queueName, { durable: true });
            channel.consume(queueName, (msg) => {
                if (msg !== null) {
                    const messageContent = JSON.parse(msg.content.toString());
                    callback(messageContent);
                    channel.ack(msg);
                }
            });
            connection.on('close', () => {
                console.log('Connection to RabbitMQ closed');
            });
            connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
            });
        });
    });
};
exports.consumeQueue = consumeQueue;
