// IUserRepository.ts

import { User } from "../entities/User";

export interface IUserRepository {
    signup(user: User): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserByUsername(username: string): Promise<User | null>;
    saveOtp(otp: number, userId: string):Promise<void>
    verifyOtp(otp: string, email: string): Promise<User>
    updateUserPassword(userId: string, newPassword: string): Promise<void>
}
