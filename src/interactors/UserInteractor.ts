import { User } from "../entities/User";
import { IUserInteractor } from "../interfaces/IUserInteractor";
import { IUserRepository } from "../interfaces/IUserRepository";
import { IMailer } from "../interfaces/IMailer";
import { IMessageBroker } from "../interfaces/IMessageBroker";
import { UserSignupDTO } from "../entities/UserSignupDTO";
import bcrypt from 'bcryptjs';
import CustomError from '../utils/CustomError';
import generateOTP from "../utils/otp";
import { Otp } from "../entities/Otp";
import { generateToken, verifyRefreshToken } from "../utils/jwt";
import crypto from 'crypto';
import { AuthenticatedUser, AuthResponse } from "../entities/Types";
import { publishToQueue } from "../services/RabbitMQPublisher";
// import { publishUserCreationMessages } from "../queues/circuitBreaker";
import { PublishUserData } from "../entities/Types";
import { profile } from "console";
import redisService from "../services/redisClient";
import { json } from "stream/consumers";


export class UserInteractor implements IUserInteractor {
  private repository: IUserRepository;
  private mailer: IMailer;
  private broker: IMessageBroker;

  constructor(repository: IUserRepository, mailer: IMailer, broker: IMessageBroker) {
    this.repository = repository;
    this.mailer = mailer;
    this.broker = broker;
  }

  async createUser(userDTO: UserSignupDTO): Promise<string> {
    try {
      const existingUser = await this.repository.findUserByEmail(userDTO.email);
      if (existingUser && existingUser.isVerified === true) {
        throw new CustomError("User with this email already exists", 409);
      }

      const existingUserName = await this.repository.findUserByUsername(userDTO.username);
      if (existingUserName) {
        throw new CustomError('Username already exists', 409);
      }

      const hashedPassword = await bcrypt.hash(userDTO.password, 10);

      const user = new User(
        "",
        userDTO.username,
        userDTO.displayName,
        userDTO.email,
        hashedPassword,
        new Date(),
        new Date(),
        false,
        false,
        false,
        undefined,
        undefined,
        undefined,
        userDTO.birthDate,
      );
      const createdUser = await this.repository.signup(user);

      const otp = generateOTP()
      await this.repository.saveOtp(otp, createdUser.id)
      await this.mailer.SendMail(createdUser.email, { subject: "OTP verification", text: String(otp) })
      return createdUser.id;

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }
  
  async verifyOtp(otp: string, email: string): Promise<void> {
    try {
      const verifiedUser = await this.repository.verifyOtp(otp, email);
      if (verifiedUser) {
        const userMessage ={
          userId: verifiedUser.id,
          username: verifiedUser.userName,
          displayName: verifiedUser.displayName,
          profileImage: verifiedUser.profileImage,
          isBlocked: verifiedUser.isBlocked
        };
  
        await this.broker.publishUserCreationMessage(userMessage )
        await this.broker.publishStreamingServiceUserCreation(userMessage);

        const userMessageToAdminService = {
          _id: verifiedUser.id,
          email: verifiedUser.email,
          username: verifiedUser.userName,
          displayName: verifiedUser.displayName,
          dateOfBirth: verifiedUser.dateOfBirth,
          profileImage: verifiedUser.profileImage,
          bio: verifiedUser.bio,
          createdAt: verifiedUser.createdAt,
          updatedAt: verifiedUser.updatedAt,
          isVerified: verifiedUser.isVerified,
          isGoogleUser: verifiedUser.isGoogleUser,
          isBlocked: verifiedUser.isBlocked,
        };

        await this.broker.PublishUserCreationMessageAdminServices(userMessageToAdminService)

        await redisService.set(
          `user:${verifiedUser.id}`, 
          JSON.stringify({
            userId: verifiedUser.id,
            email: verifiedUser.email,
            username: verifiedUser.userName,
            createdAt: verifiedUser.createdAt,
            status: "active"
          }),
          'EX', 
          30 * 24 * 60 * 60  
        );
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
  

  async resendOtp(email: string): Promise<void> {
    try {
      const user = await this.repository.findUserByEmail(email);
      if (!user) {
        throw new CustomError("User not found", 404);
      }
      const newOtp = generateOTP();
      await this.repository.saveOtp(newOtp, user.id);
      await this.mailer.SendMail(email, { subject: "Your new otp", text: String(newOtp) })
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async createGoogleUser(email: string, profileImage: string, userName: string): Promise<AuthResponse> {
    try {
      console.log(email, profileImage, userName)
      const existingUser = await this.repository.findUserByEmail(email);

      if (existingUser) {
        if (existingUser.isBlocked) {
          throw new CustomError("Account is temporarily blocked!", 403);
        }
        if (!existingUser.isGoogleUser) {
          throw new CustomError('Please login using your email and password.', 400);
        }

        const { accessToken, refreshToken } = generateToken(existingUser.id);
        return {
          accessToken,
          refreshToken,
          user: {
            id: existingUser.id,
            username: existingUser.userName,
            displayName: existingUser.displayName ?? existingUser.userName,
            email: existingUser.email,
            profileImage: existingUser.profileImage,
            titleImage: existingUser.titleImage,
            bio: existingUser.bio,
          },
        };
      }

      // const existingUsername = await this.repository.findUserByUsername(userName);
      // if (existingUsername) {
      //     throw new CustomError('Username already exists', 409);
      // }
      const existingUsername = await this.repository.findUserByUsername(userName);
      if (existingUsername) {
        return { isUsernameTaken: true };
      }

      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = new User(
        "",
        userName,
        userName,
        email,
        hashedPassword,
        new Date(), // createdAt
        new Date(), // updatedAt
        false, // isVerified
        true, // isGoogleUser
        false, // isBlocked
        profileImage, // profileImage
        undefined, // titleImage can be set as needed
        undefined,  // bio can be set as needed
        undefined, // dateOfBirth can be set as needed
      );

      const createdUser = await this.repository.signup(newUser);

      if (createdUser) {
        const userMessage ={
          userId: createdUser.id,
          username: createdUser.userName,
          displayName: createdUser.displayName,
          profileImage: createdUser.profileImage,
          isBlocked: createdUser.isBlocked
        };
  
        await this.broker.publishUserCreationMessage(userMessage )
      }

      const { accessToken, refreshToken } = generateToken(createdUser.id);
      return {
        accessToken,
        refreshToken,
        user: {
          id: createdUser.id,
          username: createdUser.userName,
          displayName: createdUser.displayName ?? '',
          email: createdUser.email,
          profileImage: createdUser.profileImage,
          titleImage: createdUser.titleImage,
          bio: createdUser.bio,
        },
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async VerifyUser(email: string, password: string): Promise<AuthenticatedUser> {
    try {
      const existingUser = await this.repository.findUserByEmail(email);
      if (!existingUser) {
        throw new CustomError('User not found. Signup to continue.', 404);
      }
      if (existingUser.isGoogleUser) {
        throw new CustomError('Continue signup using Google.', 302);
      }
      if (!bcrypt.compareSync(password, existingUser.password)) {
        throw new CustomError('Invalid credentials', 401);
      }
      if (existingUser.isBlocked === true) {
        throw new CustomError('Account temporarily blocked', 403);
      }
      const { accessToken, refreshToken } = generateToken(existingUser.id);
      const user = {
        id: existingUser.id,
        username: existingUser.userName,
        displayName: existingUser.displayName ?? '',
        email: existingUser.email,
        profileImage: existingUser.profileImage,
        titleImage: existingUser.titleImage,
        bio: existingUser.bio,
      };
      const redisUserData = JSON.stringify({
        userId: existingUser.id,
        email: existingUser.email,
        username: existingUser.userName,
        createdAt: existingUser.createdAt,
        status: "active",
      });
  
      await redisService.set(
        `user:${existingUser.id}`,
        redisUserData, 
        'EX', 
        30 * 24 * 60 * 60 
      );

      return { user, accessToken, refreshToken };

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async confirmMail(email: string): Promise<void> {
    try {
      const user = await this.repository.findUserByEmail(email);
      if (!user) {
        console.log("User not found");
        throw new CustomError("User not found", 404);
      }

      console.log(`User found: ${user.email}`);
      const { isGoogleUser, isVerified, isBlocked } = user;
      if (isGoogleUser) {
        console.log("Google user detected");
        throw new CustomError('Please continue login using Google', 302);
      }

      if (isVerified && !isBlocked) {
        const userID = user.id
        const otp = generateOTP();
        await this.repository.saveOtp(otp, userID)
        await this.mailer.SendMail(email, { subject: "Your otp", text: String(otp) })
        return
      } else {
        throw new CustomError('User is not verified.', 403)
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

  async verifyConfirmMailOtp(otp: string, email: string): Promise<void> {
    try {
      console.log('otp interactor',otp, email)

      const user = await this.repository.findUserByEmail(email)
      if (!user) {
        console.log("User not found");
        throw new CustomError("User not found", 404);
      }
      await this.repository.verifyOtp(otp, email)
      if (!user.isVerified || user.isBlocked === true) {
        throw new CustomError("Account is temporarily suspended", 401);
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

  async updatePassword(newPassword: string, email: string): Promise<void> {

    try {
      const user = await this.repository.findUserByEmail(email)
      if (!user) {
        console.log("User not found");
        throw new CustomError("User not found", 404);
      }
      if (user.isBlocked || !user.isVerified) {
        throw new CustomError('Account is not verified', 403);
      }
      if (user.isGoogleUser) {
        throw new CustomError('Cannot update password for Google users', 403);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await this.repository.updateUserPassword(user.id, hashedPassword);

    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }
  
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = generateToken(decoded.userId);
      return { accessToken, newRefreshToken };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async updateProfilePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.repository.findUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
  
      if (user.isBlocked || !user.isVerified) {
        throw new Error('Account is not verified');
      }
  
      if (user.isGoogleUser) {
        throw new Error('Cannot update password for Google users');
      }
      await this.repository.updateProfilePassword(user.id, currentPassword, newPassword);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async checkUserName(username: string): Promise<boolean> {
    try {
      const existingUsername = await this.repository.findUserByUsername(username);
      return !!existingUsername;
    }  catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async blockUnblockUser(userId: string, isBlocked: boolean): Promise<void> {
    try {
        await this.repository.blockUnblockUser(userId, isBlocked)
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
