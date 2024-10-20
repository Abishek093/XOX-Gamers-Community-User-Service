import { IMessageBroker } from "../interfaces/IMessageBroker";
import CircuitBreaker from "opossum";
import { publishToQueue } from "../services/RabbitMQPublisher";
import { PublishProfileImageUpdate, PublishUserData } from "../entities/Types";

const circuitBreakerOptions = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
};

export class MessageBroker implements IMessageBroker {
  private circuitBreaker;

  constructor() {
    this.circuitBreaker = new CircuitBreaker(async (message: any, queueName: string) => {
      await publishToQueue(queueName, message);
    }, circuitBreakerOptions);

    this.circuitBreaker.fallback((message: any, queueName: string) => {
      console.error(`Fallback triggered for queue ${queueName}. Message:`, message);
    });
  }

  async publishUserCreationMessage(userData: PublishUserData): Promise<void> {
    const message = {
      userId: userData.userId,
      username: userData.username,
      displayName: userData.displayName,
      profileImage: userData.profileImage,
      isBlocked: userData.isBlocked
    };

    await this.circuitBreaker.fire(message, 'content-service-create-user');
  }

  async publishProfileUpdateMessage(userData: PublishUserData): Promise<void> {
    await this.circuitBreaker.fire(userData, 'content-service-update-user');
  }

  async publishProfileImageUpdateMessage(userData: PublishProfileImageUpdate): Promise<void> {
    await this.circuitBreaker.fire(userData, 'content-service-update-profile-image');
  }
}
