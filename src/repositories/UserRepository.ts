import { NonSensitiveUserProps } from "../entities/Types";
import { User } from "../entities/User";
import { IUserRepository } from "../interfaces/IUserRepository";
import OtpModel from "../Models/OtpModel";
import { UserModel, UserMapper } from "../Models/UserModel";
import CustomError from "../utils/CustomError";
import bcrypt from 'bcryptjs'

export class UserRepository implements IUserRepository {
    async signup(user: User): Promise<User> {
        try {
            const newUser = new UserModel({
                email: user.email,
                username: user.userName,
                displayName: user.displayName,
                dateOfBirth: user.dateOfBirth,
                password: user.password,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isVerified: user.isVerified,
                isGoogleUser: user.isGoogleUser,
                isBlocked: user.isBlocked
            });

            await newUser.save();

            return UserMapper.mapToEntity(newUser);
        } catch (error) {
            throw new CustomError("Error signing up user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async findUserByEmail(email: string): Promise<User | null> {
        try {
            const userDoc = await UserModel.findOne({ email }).exec();
            return userDoc ? UserMapper.mapToEntity(userDoc) : null;
        } catch (error) {
            throw new CustomError("Error finding user by email: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async findUserByUsername(username: string): Promise<User | null> {
        try {
            const userDoc = await UserModel.findOne({ username }).exec();
            return userDoc ? UserMapper.mapToEntity(userDoc) : null;
        } catch (error) {
            throw new CustomError("Error finding user by username: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async saveOtp(otp: number, userId: string): Promise<void> {
        try {
            const otpEntry = new OtpModel({
                otp: otp,
                userId: userId,
                createdAt: new Date(),
            });
            await otpEntry.save();
        } catch (error) {
            throw new CustomError("Error saving OTP: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }


    async verifyOtp(otp: string, email: string): Promise<User> {
        try {
            console.log('Otp in repository', otp, email)
            const user = await this.findUserByEmail(email);
            if (!user) {
                throw new CustomError('Failed to verify the user.', 404);
            }

            const otpDetails = await OtpModel.findOne({ userId: user.id }).sort({ createdAt: -1 }).limit(1);
            console.log("otpDetails", otpDetails)
            if (!otpDetails) {
                throw new CustomError('Otp time has expired! Try resend Otp.', 410);
            }

            if (otpDetails.otp !== parseInt(otp)) {
                throw new CustomError('Invalid otp!', 400);
            }

            const verifiedUser = await this.verifyUser(user.id);

            return verifiedUser
        } catch (error) {
            throw new CustomError("Error verifying OTP: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async verifyUser(userId: string): Promise<User> {
        try {
            const existingUser = await UserModel.findById(userId);

            if (!existingUser) {
                throw new CustomError("User not found", 404);
            }

            existingUser.isVerified = true;
            await existingUser.save();

            return UserMapper.mapToEntity(existingUser);
        } catch (error) {
            throw new CustomError("Error verifying user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }


    async updateUserPassword(userId: string, newPassword: string): Promise<void> {
        try {
            await UserModel.findByIdAndUpdate(userId, { password: newPassword });
        } catch (error) {
            throw new CustomError("Failed to update password" + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async updateProfilePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                throw new Error("Current password is incorrect");
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
            console.log("Password updated successfully");
        } catch (error) {
            throw new CustomError("Failed to update password" + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async blockUnblockUser(userId: string, isBlocked: boolean): Promise<void> {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new CustomError('User not found', 404)
            }
            user.isBlocked = isBlocked;
            await user.save();
        } catch (error) {
            throw new CustomError("Error while Blocking/Unblocking users: " + (error instanceof Error || error instanceof CustomError ? error.message : "Unknown error"), 500);
        }
    }
}
