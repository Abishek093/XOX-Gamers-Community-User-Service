import { IChatModel } from "../Models/ChatModel";
import { IMessage } from "../Models/MessageModel";

export interface IChatRepository{
    checkChat(initiatorId: string, recipientId: string): Promise<IChatModel | null>;
    newChat(initiatorId: string, recipientId: string): Promise<IChatModel | null>;
    fetchConversations(userId: string): Promise<IChatModel[]>;
    fetchMessages(chatId: string): Promise<IMessage[]> ;
    fetchLastMessage(chatId: string): Promise<IMessage | null>;
    deleteMessage(id : string):Promise<void>;
    findChatByUserId(userId: string):Promise<IChatModel[]>;
    getUnreadMessageCount (chatId: string, userId: string): Promise<number>
}