import { NextFunction, Request, Response } from "express";
import { IChatInteractor } from "../interfaces/IChatInteractor";

export class ChatController {
    constructor(private interactor: IChatInteractor) { }

    checkChat = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { initiatorId, recipientId } = req.params;
            const chat = await this.interactor.CheckChatUseCase(initiatorId, recipientId);
            if (chat) {
                console.log(chat)
                res.status(200).json(chat)
            } else {
                console.log('Chat not found')
                res.status(204).json('Chat not found')
            }
        } catch (error) {
            next(error)
        }
    };

    newChat = async (req: Request, res: Response, next: NextFunction) => {
        const { initiatorId, recipientId } = req.params;
        console.log("1", initiatorId, recipientId)
        try {
            const newChat = await this.interactor.NewChatUseCase(initiatorId, recipientId)
            res.status(200).json(newChat)
        } catch (error) {
            next(error)
        }
    }

    fetchConversations = async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params
        try {
            const conversations = await this.interactor.FetchConversationsUseCase(userId)
            res.status(200).json(conversations)
        } catch (error) {
            next(error)
        }
    }

    fetchMessages = async (req: Request, res: Response, next: NextFunction) => {
        const { chatId } = req.params;
        try {
            const messages = await this.interactor.FetchMessagesUseCase(chatId)
            res.status(200).json(messages)
        } catch (error) {
            next(error)
        }
    };

    fetchLastMessage = async (req: Request, res: Response, next: NextFunction) => {
        const { chatId } = req.params;
        try {
            const lastMessage = await this.interactor.FetchLastMessageUseCase(chatId);
            res.status(200).json(lastMessage);
        } catch (error) {
            next(error)
        }
    };


    deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            console.log("message id", id)
            const msg = await this.interactor.DeleteMessageUseCase(id)
            res.status(200).json("deleted succesfully")
        } catch (error) {
            next(error)
        }
    }


    fetchUnreadCountsController = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.userId;
            const unreadCounts = await this.interactor.FetchUnreadCountsUseCase(userId);

            if (unreadCounts) {
                res.status(200).json( unreadCounts);
            } else {
                res.status(404).json("No unread messages found");
            }
        } catch (error) {
            next(error)
        }
    };

}