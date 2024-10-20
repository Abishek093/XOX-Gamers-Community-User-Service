// IUserInteractor.ts

import { AuthenticatedUser, AuthResponse } from "../entities/Types";
import { User } from "../entities/User";
import { UserSignupDTO } from "../entities/UserSignupDTO";

export interface IUserInteractor {
    createUser(user: UserSignupDTO): Promise<string>;  
    verifyOtp(otp: string, email: string): Promise<void>
    resendOtp(email: string): Promise<void>
    createGoogleUser(email: string, profileImage: string, userName: string): Promise<AuthResponse> 
    VerifyUser(email: string, password: string): Promise<AuthenticatedUser>
    confirmMail(email: string): Promise<void>
    verifyConfirmMailOtp(otp: string, email: string): Promise<void>
    updatePassword(newPassword: string, email: string):Promise<void>
    refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }>
}
