import { NonSensitiveUserProps, UserProps } from "../entities/Types";

export interface IProfileInteractor {
    updateUser(userId: string, userData: Partial<UserProps>): Promise<NonSensitiveUserProps>
    updateUserProfileImage(userId: string, profileImage: string): Promise<string>
    updateUserTitleImage(userId: string, titleImage: string): Promise<string>
}