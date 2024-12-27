"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishToQueue = void 0;
const callback_api_1 = __importDefault(require("amqplib/callback_api"));
const rabbitmqUrl = `amqp://${process.env.RABBITMQ_HOST || 'localhost'}`;
const publishToQueue = (queueName, message) => {
    return new Promise((resolve, reject) => {
        callback_api_1.default.connect(rabbitmqUrl, (connectError, connection) => {
            if (connectError) {
                return reject(connectError);
            }
            connection.createChannel((channelError, channel) => {
                if (channelError) {
                    return reject(channelError);
                }
                const messageBuffer = Buffer.from(JSON.stringify(message));
                channel.assertQueue(queueName, { durable: true });
                channel.sendToQueue(queueName, messageBuffer);
                console.log(`Message send to queue ${queueName}: `, message);
                resolve();
            });
        });
    });
};
exports.publishToQueue = publishToQueue;
