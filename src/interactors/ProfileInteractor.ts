import { log } from "console";
import { NonSensitiveUserProps, UserProps } from "../entities/Types";
import { IProfileInteractor } from "../interfaces/IProfileInteractor";
import CustomError from "../utils/CustomError";
import { IUserRepository } from "../interfaces/IUserRepository";
import { IProfileRepository } from "../interfaces/IProfileRepository";
import { uploadToS3 } from "../utils/s3Uploader";
import { IMessageBroker } from "../interfaces/IMessageBroker";

export class ProfileInteractor implements IProfileInteractor {
    private userRepository: IUserRepository;
    private profileRepository: IProfileRepository;
    private broker: IMessageBroker;

    constructor(userRepository: IUserRepository, profileRepository: IProfileRepository, broker: IMessageBroker) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.broker = broker
    }


    async updateUser(userId: string, userData: Partial<UserProps>): Promise<NonSensitiveUserProps>{
        try {
            log("UpdateUserUseCase", userData, userId)
            if (!userData.username || userData.username.trim() === '') {
                throw new CustomError('Username should not be empty', 400);
            }
            const updatedUser = await this.profileRepository.updateUser(userId, userData);
            if(updatedUser){
                if (userData.username || userData.displayName) {
                  const message = {
                    userId: updatedUser.id,
                    username: updatedUser.userName,
                    displayName: updatedUser.displayName,
                    profileImage: updatedUser.profileImage,
                    isBlocked: updatedUser.isBlocked
                  };
          
                  try {
                    await this.broker.publishProfileUpdateMessage(message); 
                    console.log("User update data published to queue:", message);
                  } catch (error) {
                    console.error("Failed to publish update message to queue via CircuitBreaker:", error);
                  }
                }
                  return{
                      id: updatedUser.id,
                      email: updatedUser.email,
                      username: updatedUser.userName,
                      displayName: updatedUser.displayName,
                      profileImage:updatedUser.profileImage,
                      titleImage: updatedUser.titleImage,
                      bio:updatedUser.bio,
                      dateOfBirth: updatedUser.dateOfBirth
                  }
              }else{
                throw new CustomError("Failed to update user!", 500);

              }
        } catch (error) {
            if (error instanceof CustomError) {
              throw error;
            } else {
              console.error(error);
              throw new CustomError("Internal Server Error", 500);
            }
          }
    }


    async updateUserProfileImage(userId: string, profileImage: string): Promise<string> {
        try {
            console.log("User ID:", userId, "Profile Image URL:", profileImage);
            
            if (!profileImage) {
                throw new CustomError('Profile image data is missing', 400);
            }
    
            const updatedProfileImageUrl = await this.profileRepository.updateUserProfileImage(userId, profileImage);
            if(updatedProfileImageUrl){
              await this.broker.publishProfileImageUpdateMessage({
                userId: userId,
                profileImage: updatedProfileImageUrl,
              });
            }
            return updatedProfileImageUrl; 
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }
    
    async updateUserTitleImage(userId: string, titleImage: string): Promise<string> {
        try {
          console.log("User ID:", userId, "Title Image URL:", titleImage);
      
          if (!titleImage) {
            throw new CustomError('Title image data is missing', 400);
          }
      
          const updatedTitleImageUrl = await this.profileRepository.updateUserTitleImage(userId, titleImage);
          return updatedTitleImageUrl; 
        } catch (error) {
          if (error instanceof CustomError) {
            throw error;
          } else {
            console.error(error);
            throw new CustomError("Internal Server Error", 500);
          }
        }
      }
      
}
