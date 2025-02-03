import { consumeQueue } from "./RabbitMQConsumer";
import { UserRepository } from "../repositories/UserRepository";
import { UserInteractor } from "../interactors/UserInteractor";
import { Mailer } from "../external-libraries/mailer";
import { MessageBroker } from "../external-libraries/messageBroker";
import { ProfileInteractor } from "../interactors/ProfileInteractor";
import { ProfileRepository } from "../repositories/ProfileRepository";
import { ChatRepository } from "../repositories/ChatRepository";
import CustomError from "../utils/CustomError";
import { publishToQueue } from "./RabbitMQPublisher";


export const startQueueConsumer = () => {
  const mailer = new Mailer()
  const broker = new MessageBroker()
  const userRepository = new UserRepository();
  const profileRepository = new ProfileRepository()
  const userInteractor = new UserInteractor(userRepository, mailer, broker);
  const profileInteractor = new ProfileInteractor(userRepository, profileRepository, broker)

  const chatRepository = new ChatRepository()

  consumeQueue('user-service-block-user', async (userData) => {
    try {
      console.log('userData', userData)
      await userInteractor.blockUnblockUser(userData.id, userData.isBlocked)
      // await userInteractor.createUser(userData);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  });

  consumeQueue('user-service-chat-get-unread-count', async ({ chatId, userId }) => {
    try {
      const unreadCount = await chatRepository.getUnreadMessageCount(chatId, userId);
      await publishToQueue('unread-count-update', {
        chatId,
        userId,
        count: unreadCount
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  });



  consumeQueue('user-service-chat-new-message', async (newMessage) => {
    try {
      console.log("received data", newMessage)
      const populatedMessage = await chatRepository.newMessage(newMessage)
      await publishToQueue('new-message-response', populatedMessage)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  })


  consumeQueue('user-service-chat-message-seen', async ({ userID, chatID, messageIds }) => {
    try {
      console.log("received data message seen", userID, chatID, messageIds)
      const response = await chatRepository.messageSeen(userID, chatID, messageIds)
      await publishToQueue('message-seen-response', response)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  })
}