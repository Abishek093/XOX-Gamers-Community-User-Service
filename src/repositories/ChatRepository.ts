import { IChatRepository } from "../interfaces/IChatRepository";
import ChatModel, { IChatModel } from "../Models/ChatModel";
import { ObjectId } from 'mongodb';
import CustomError from "../utils/CustomError";
import MessageModel, { IMessage } from "../Models/MessageModel";
import mongoose from "mongoose";
import { PopulatedMessage } from "../entities/Types";
import { MessageSeenResult } from "../entities/MessageDTO";

export class ChatRepository implements IChatRepository {
    async checkChat(initiatorId: string, recipientId: string): Promise<IChatModel | null> {
        try {
            return await ChatModel.findOne({
                users: { $all: [new ObjectId(initiatorId), new ObjectId(recipientId)] },
            });
        } catch (error) {
            throw new CustomError("Error finding chat: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }


    async findChatByUserId(userId: string): Promise<IChatModel[]> {
        try {
            const chats = await ChatModel.find({ users: userId });
            return chats

        } catch (error) {
            throw new CustomError("Error finding chat: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }


    async newChat(initiatorId: string, recipientId: string): Promise<IChatModel | null> {
        try {
            const existingChat = await this.checkChat(initiatorId, recipientId);
            if (existingChat) {
                console.log("Chat already exists", existingChat);
                return existingChat;
            }

            const newChat = new ChatModel({
                users: [new ObjectId(initiatorId), new ObjectId(recipientId)],
                initiator: new ObjectId(initiatorId),
                is_blocked: false,
                is_accepted: 'pending'
            });
            await newChat.save();
            return newChat;
        } catch (error) {
            throw new CustomError("Error creating chat: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async fetchConversations(userId: string): Promise<IChatModel[]> {
        try {
            const conversations = await ChatModel.find({
                users: userId,
                is_accepted: { $in: ['pending', 'accepted'] },
            })
                .populate({
                    path: 'users',
                    match: { _id: { $ne: userId } },
                    select: 'username displayName profileImage',
                });

            return conversations;
        } catch (error) {
            throw new CustomError("Error fetching conversation: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async fetchMessages(chatId: string): Promise<IMessage[]> {
        try {
            const messages = await MessageModel.find({ chatId }).populate('sender', 'displayName profileImage');
            return messages
        } catch (error) {
            throw new CustomError("Error fetching messages: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async fetchLastMessage(chatId: string): Promise<IMessage | null> {
        try {
            const lastMessage = await MessageModel.findOne({ chatId })
                .sort({ createdAt: -1 })
                .populate('sender', 'displayName profileImage');
            return lastMessage;
        } catch (error) {
            throw new CustomError("Error fetching last message: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }



    async deleteMessage(id: string): Promise<void> {
        try {
            const message = await MessageModel.findByIdAndDelete(id)
        } catch (error) {
            throw new CustomError("Error deleting messages: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async getUnreadMessageCount(chatId: string, userId: string): Promise<number> {
        try {
            const unreadCount = await MessageModel.countDocuments({
                chatId: new mongoose.Types.ObjectId(chatId),
                sender: { $ne: userId },
                seen: false,
            });

            return unreadCount;
        } catch (error) {
            throw new CustomError("Error getting unread message count: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }


    async newMessage(messageData: IMessage): Promise<PopulatedMessage> {
        try {
            const { chatId, sender, content, media, repliedTo } = messageData;
            console.log("New message data: ", { chatId, sender, content, media, repliedTo })

            const newMessage = new MessageModel({
                chatId: new mongoose.Types.ObjectId(chatId),
                sender: new mongoose.Types.ObjectId(sender._id),
                content,
                media,
                repliedTo: repliedTo ? new mongoose.Types.ObjectId(repliedTo) : null,
            });
            console.log("New message: ", newMessage)

            await newMessage.save();

            const populatedMessage = await newMessage.populate<{ sender: PopulatedMessage["sender"] }>(
                "sender",
                "displayName profileImage"
            );

            console.log("New populated message: ", populatedMessage)

            return populatedMessage as PopulatedMessage;
        } catch (error) {
            throw new CustomError("Failed to save and populate the messaget: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }


    // async messageSeen(userId: string, chatId: string, messageIds: string[]): Promise<MessageSeenResult> {
    //     try {
    //         console.log(`Processing messageSeen - userID: ${userId}, chatID: ${chatId}, messageIDs: ${messageIds}`);

    //         if (!userId || !chatId) {
    //             throw new CustomError('Invalid user ID or chat ID', 400);
    //         }

    //         const messagesToUpdate = messageIds.map(id => new mongoose.Types.ObjectId(id));

    //         const messages = await MessageModel.find({
    //             _id: { $in: messagesToUpdate },
    //             sender: { $ne: new mongoose.Types.ObjectId(userId) } 
    //         })
    //         .select('sender')
    //         .lean();

    //         if (!messages.length) {
    //             throw new CustomError('No messages found to update', 404);
    //         }

    //         // Update seen status
    //         await MessageModel.updateMany(
    //             {
    //                 _id: { $in: messagesToUpdate },
    //                 chatId: new mongoose.Types.ObjectId(chatId),
    //                 sender: { $ne: new mongoose.Types.ObjectId(userId) }
    //             },
    //             {
    //                 $set: {
    //                     seen: true,
    //                     updatedAt: new Date()
    //                 }
    //             }
    //         );

    //         return {
    //             chatId,
    //             messageIds: messagesToUpdate.map(id => id.toString()),
    //             seenBy: userId 
    //         };
    //     } catch (error) {
    //         if (error instanceof CustomError) {
    //             throw error;
    //         }
    //         throw new CustomError(
    //             `Failed to update message seen status: ${error instanceof Error ? error.message : "Unknown error"}`,
    //             500
    //         );
    //     }
    // }

    // async messageSeen(userId: string, chatId: string, messageIds: string[]): Promise<MessageSeenResult> {
    //     try {
    //         console.log(`Processing messageSeen - userID: ${userId}, chatID: ${chatId}, messageIDs: ${messageIds}`);

    //         if (!userId || !chatId) {
    //             throw new CustomError('Invalid user ID or chat ID', 400);
    //         }

    //         const messagesToUpdate = messageIds.map(id => new mongoose.Types.ObjectId(id));

    //         // First check if the messages exist in the chat
    //         const messages = await MessageModel.find({
    //             _id: { $in: messagesToUpdate },
    //             chatId: new mongoose.Types.ObjectId(chatId)
    //         })
    //         .select('sender seen')
    //         .lean();

    //         if (!messages.length) {
    //             throw new CustomError('No messages found in the specified chat', 404);
    //         }

    //         // Update seen status for all messages in the chat
    //         const updateResult = await MessageModel.updateMany(
    //             {
    //                 _id: { $in: messagesToUpdate },
    //                 chatId: new mongoose.Types.ObjectId(chatId),
    //                 seen: false  // Only update unseen messages
    //             },
    //             {
    //                 $set: {
    //                     seen: true,
    //                     updatedAt: new Date()
    //                 }
    //             }
    //         );

    //         if (updateResult.modifiedCount === 0) {
    //             console.log('No messages were updated - they may already be marked as seen');
    //         }

    //         return {
    //             chatId,
    //             messageIds: messagesToUpdate.map(id => id.toString()),
    //             seenBy: userId 
    //         };
    //     } catch (error) {
    //         if (error instanceof CustomError) {
    //             throw error;
    //         }
    //         throw new CustomError(
    //             `Failed to update message seen status: ${error instanceof Error ? error.message : "Unknown error"}`,
    //             500
    //         );
    //     }
    // }

    // In ChatRepository.ts

    async messageSeen(userId: string, chatId: string, messageIds: string[]): Promise<MessageSeenResult> {
        try {
            if (!userId || !chatId) {
                throw new CustomError('Invalid user ID or chat ID', 400);
            }

            const messagesToUpdate = messageIds.map(id => new mongoose.Types.ObjectId(id));

            // Add transaction to ensure atomic updates
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const updateResult = await MessageModel.updateMany(
                    {
                        _id: { $in: messagesToUpdate },
                        chatId: new mongoose.Types.ObjectId(chatId),
                        sender: { $ne: new mongoose.Types.ObjectId(userId) },
                        seen: false
                    },
                    {
                        $set: {
                            seen: true,
                            updatedAt: new Date()
                        }
                    },
                    { session }
                );

                await session.commitTransaction();

                return {
                    chatId,
                    messageIds: messagesToUpdate.map(id => id.toString()),
                    seenBy: userId
                };
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } catch (error) {
            throw new CustomError(
                `Failed to update message seen status: ${error instanceof Error ? error.message : "Unknown error"}`,
                500
            );
        }
    }
}