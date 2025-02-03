import { IChatInteractor } from "../interfaces/IChatInteractor";
import { IChatRepository } from "../interfaces/IChatRepository";
import { IChatModel } from "../Models/ChatModel";
import { IMessage } from "../Models/MessageModel";
import CustomError from "../utils/CustomError";

export class ChatInteractor implements IChatInteractor {
    constructor(private repository: IChatRepository) { }

    CheckChatUseCase = async (initiatorId: string, recipientId: string): Promise<IChatModel | null> => {
        try {
            const chat = await this.repository.checkChat(initiatorId, recipientId);
            return chat;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    };

    NewChatUseCase = async (initiatorId: string, recipientId: string): Promise<IChatModel | null> => {
        try {
            console.log("2", initiatorId, recipientId)
            const newChat = await this.repository.newChat(initiatorId, recipientId)
            return newChat
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }


    FetchConversationsUseCase = async (userId: string): Promise<IChatModel[]> => {
        try {
            const conversations = await this.repository.fetchConversations(userId)
            return conversations
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }


    FetchMessagesUseCase = async (chatId: string): Promise<IMessage[]> => {
        try {
            const messages = await this.repository.fetchMessages(chatId)
            return messages
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }

    FetchLastMessageUseCase = async (chatId: string): Promise<IMessage | null> => {
        try {
            const lastMessage = await this.repository.fetchLastMessage(chatId);
            return lastMessage;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    };

    DeleteMessageUseCase = async (id: string):Promise<void> => {
        try {
            const msg = await this.repository.deleteMessage(id)
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }


FetchUnreadCountsUseCase = async (userId: string): Promise<{ [key: string]: number }> => {
  try {
    const chats = await this.repository.findChatByUserId(userId)

    const unreadCounts: { [key: string]: number } = {};
    for (const chat of chats) {
      const unreadCount = await this.repository.getUnreadMessageCount(chat.id.toString(), userId);
      unreadCounts[chat.id.toString()] = unreadCount;
    }
    return unreadCounts;
  } catch (error) {
    console.error("Error in fetchUnreadCountsUseCase:", error);
    throw new Error("Failed to fetch unread counts");
  }
}

}