import { IChatModel } from "../Models/ChatModel";
import { IMessage } from "../Models/MessageModel";

export interface IChatInteractor{
    CheckChatUseCase(initiatorId: string, recipientId: string):Promise<IChatModel | null>;
    NewChatUseCase(initiatorId: string, recipientId: string): Promise<IChatModel | null>;
    FetchConversationsUseCase(userId: string): Promise<IChatModel[]>;
    FetchMessagesUseCase(chatId: string): Promise<IMessage[]> 
    FetchLastMessageUseCase(chatId: string):Promise<IMessage | null>
    DeleteMessageUseCase(id: string):Promise<void>
    FetchUnreadCountsUseCase(userId: string): Promise<{ [key: string]: number }> 
}
