import { PublishProfileImageUpdate, PublishUserData, userMessageToAdminService } from "../entities/Types";

export interface IMessageBroker{
    publishUserCreationMessage(userData: PublishUserData): Promise<void>
    publishProfileUpdateMessage(userData: PublishUserData):Promise<void>
    publishProfileImageUpdateMessage(userData: PublishProfileImageUpdate):Promise<void>
    PublishUserCreationMessageAdminServices(userData: userMessageToAdminService):Promise<void>
    publishStreamingServiceUserCreation(userData: PublishUserData): Promise<void>;

}