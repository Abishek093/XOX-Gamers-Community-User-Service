import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserRepository } from "../repositories/UserRepository";
import { UserInteractor } from "../interactors/UserInteractor";
import { Mailer } from "../external-libraries/mailer";
import { MessageBroker } from "../external-libraries/messageBroker";
import { protectUser } from "../middlewares/authMiddleware";
import { ProfileRepository } from "../repositories/ProfileRepository";
import { ProfileInteractor } from "../interactors/ProfileInteractor";
import { ProfileController } from "../controllers/ProfileController";
import { ConnectionRepository } from "../repositories/ConnectionRepository";
import { ConnectionInteractor } from "../interactors/ConnectionInteractor";
import { ConnectionController } from "../controllers/ConnectionController";
const UserRouter = Router()

const userRepository = new UserRepository()
const profileRepository = new ProfileRepository()
const mailer = new Mailer()
const broker = new MessageBroker()
const interactor = new UserInteractor(userRepository, mailer, broker)
const profileInteractor = new ProfileInteractor(userRepository, profileRepository, broker)


const connectionRepository = new ConnectionRepository()
const connectionInteractor = new ConnectionInteractor(connectionRepository)
const connectionController = new ConnectionController(connectionInteractor)


const authController = new AuthController(interactor)
const profileController = new ProfileController(interactor, profileInteractor)

/* Public Routes */
UserRouter.post('/signup', authController.signupUser.bind(authController))
UserRouter.post('/verify-otp', authController.verifyOtp.bind(authController))
UserRouter.post("/resend-otp", authController.resendOTP.bind(authController))
UserRouter.post("/googleAuth", authController.googleAuth.bind(authController))
UserRouter.post("/login", authController.verifyLogin.bind(authController));
UserRouter.post("/confirm-mail", authController.confirmMail.bind(authController));
UserRouter.post("/confirm-mail-otp", authController.confirmMail.bind(authController));
UserRouter.post("/update-password", authController.updatePassword.bind(authController));
UserRouter.post("/refresh-token", authController.refreshAccessToken.bind(authController));
/** */

/* Profile Routes */
UserRouter.patch("/update-user/:id", protectUser, profileController.updateUser.bind(profileController));
UserRouter.post("/upload-url", profileController.generatePresignedUrl.bind(profileController));

UserRouter.post("/update-profile-image", protectUser, profileController.updateProfileImage.bind(profileController));
UserRouter.post("/update-title-image", protectUser, profileController.updateTitleImage.bind(profileController));


UserRouter.post("/follower/:followerId/user/:userId", protectUser, connectionController.followUser.bind(connectionController))
UserRouter.delete('/follower/:followerId/user/:userId', protectUser, connectionController.unfollowUser.bind(connectionController))
export default UserRouter