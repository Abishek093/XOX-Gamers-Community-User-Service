import { NextFunction, Request, Response } from "express";
import { IUserInteractor } from "../interfaces/IUserInteractor";
import { UserSignupDTO } from "../entities/UserSignupDTO";
import { handleResponse } from "../utils/ResponseHandler";
import CustomError from "../utils/CustomError";
import { AuthenticatedUser } from "../entities/Types";

export class AuthController {
  private interactor: IUserInteractor;

  constructor(interactor: IUserInteractor) {
    this.interactor = interactor;
  }

  async signupUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, username, displayName, birthDate, password } = req.body;
      console.log(req.body)
      console.log(email, username, displayName, birthDate, password)
      const userDTO = new UserSignupDTO(username, email, displayName, password, birthDate)
      const createdUser = await this.interactor.createUser(userDTO);
      console.log("cretated user", createdUser)
      // res.status(201).json({
      //     message: "User created successfully",
      //     data: createdUser,
      // });
      handleResponse(res, 201, createdUser)
    } catch (error) {
      next(error);
    }
  }

  verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { otp, email } = req.body;
      console.log('otp from body',otp, email)
      await this.interactor.verifyOtp(otp, email)
      return handleResponse(res, 200, 'User verified successfully');
    } catch (error) {
      next(error);
    }
  };

  resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body
      await this.interactor.resendOtp(email)
      handleResponse(res, 200, 'Otp send successfully');
    } catch (error) {
      next(error)
    }
  }

  googleAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, email, profileImage } = req.body;
      console.log("auth controller", username, email, profileImage)
      const response = await this.interactor.createGoogleUser(email, profileImage, username);

      if ('isUsernameTaken' in response) {
        handleResponse(res, 200, response);
      } else {
        const { accessToken, refreshToken, user } = response as AuthenticatedUser;
        // handleResponse(res, 200, { accessToken, refreshToken, user });
        res.status(200).json({ accessToken, refreshToken, user })
      }
    } catch (error) {
      if (error instanceof CustomError && error.message === 'Username already exists') {
        handleResponse(res, 200, { isUsernameTaken: true });
      } else {
        next(error);
      }
    }
  }

  verifyLogin = async (req: Request, res: Response,  next: NextFunction): Promise<void> => {
    const { email, password } = req.body;
    try {
      const authenticatedUser = await this.interactor.VerifyUser(email, password);
      res.status(200).json(authenticatedUser)
    } catch (error) {
      next(error)
    }
  };


  confirmMail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.interactor.confirmMail(email)
      res.status(200).json({ success: true, message: 'Mail confirmed successfully.', email: email });
    } catch (error) {
      next(error)
    }
  }

  verifyConfirmMailOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { otp, email } = req.body;
      console.log('otp from body',otp, email)
      await this.interactor.verifyConfirmMailOtp(otp, email)
      res.status(200).json({ success: true, message: 'Mail confirmed successfully.', email });

    } catch (error) {
      next(error)
    }
  }

  updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, newPassword } = req.body;
      console.log("Auth controller",email, newPassword)
      await this.interactor.updatePassword(newPassword, email);
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error: any) {
      console.error('Update password failed:', error);
      next(error)
    }
  };

  refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { refreshToken } = req.body;
    try {
      const { accessToken, newRefreshToken } = await this.interactor.refreshAccessToken(refreshToken);
      res.status(200).json({ accessToken, refreshToken: newRefreshToken })
    }  catch (error: any) {
      next(error)
    }
  };

  updateProfilePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, currentPassword, newPassword } = req.body;

    try {
        await this.interactor.updateProfilePassword(email, currentPassword, newPassword);
        res.status(200).json({ status: 200, message: 'Password updated successfully' });
    }  catch (error: any) {
      next(error)
    }
};

checkUsername = async (req: Request, res: Response): Promise<void> => {
  try {
    const username = req.query.username;
    if (typeof username !== 'string') {
      throw new CustomError('Invalid username',400)
    }
      const isAvailable = await this.interactor.checkUserName(username);
      res.status(200).json({ available: !isAvailable });
  } catch (error) {
      console.error("Error checking username availability: ", error);
      res.status(500).json({ error: 'Internal server error' });
  }
};
}
