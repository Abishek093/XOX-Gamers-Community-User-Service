import amqp from 'amqplib/callback_api';
const rabbitmqUrl = `amqp://${process.env.RABBITMQ_HOST || 'localhost'}`;


export const consumeQueue = (queueName: string, callback: (message: any) => void): void => {
  amqp.connect(rabbitmqUrl, (connectError, connection) => {
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