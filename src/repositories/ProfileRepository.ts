import { UserProps } from "../entities/Types";
import { User } from "../entities/User";
import { IProfileRepository } from "../interfaces/IProfileRepository";
import { UserMapper, UserModel } from "../Models/UserModel";
import CustomError from "../utils/CustomError";

export class ProfileRepository implements IProfileRepository {

    async updateUser(userId: string, updateData: Partial<UserProps>): Promise<User> {
        try {
            const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
                new: true,
            });

            if (!updatedUser) {
                throw new CustomError("User not found", 404);
            }
            return UserMapper.mapToEntity(updatedUser);

        } catch (error) {
            throw new CustomError("Error updating user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async updateUserProfileImage(userId: string, profileImageUrl: string): Promise<string> {
        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { profileImage: profileImageUrl },
          { new: true }
        );
        
        if (!updatedUser) {
            throw new CustomError("User not found", 404);
        }
        
        console.log("Image uploaded successfully for User ID:", userId);
        return profileImageUrl; 
    }
    
    async updateUserTitleImage(userId: string, titleImageUrl: string): Promise<string> {
        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { titleImage: titleImageUrl },
          { new: true }
        );
      
        if (!updatedUser) {
          throw new CustomError("User not found", 404);
        }
      
        console.log("Title image uploaded successfully for User ID:", userId);
        return titleImageUrl; 
      }
      
}
