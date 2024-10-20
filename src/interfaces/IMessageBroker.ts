import { PublishProfileImageUpdate, PublishUserData } from "../entities/Types";

export interface IMessageBroker{
    publishUserCreationMessage(userData: PublishUserData): Promise<void>
    publishProfileUpdateMessage(userData: PublishUserData):Promise<void>
    publishProfileImageUpdateMessage(userData: PublishProfileImageUpdate):Promise<void>
}