import { UserProps } from "../entities/Types";
import { User } from "../entities/User";

export interface IProfileRepository {
    updateUser(userId: string, updateData: Partial<UserProps>): Promise<User>
    updateUserProfileImage(userId: string, profileImageUrl: string): Promise<string>
    updateUserTitleImage(userId: string, titleImageUrl: string): Promise<string>

}