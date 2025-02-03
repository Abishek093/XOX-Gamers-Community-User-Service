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
import { ChatRepository } from "../repositories/ChatRepository";
import { ChatInteractor } from "../interactors/ChatInteractor";
import { ChatController } from "../controllers/ChatController";
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

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


const chatRepository = new ChatRepository()
const chatInteractor = new ChatInteractor(chatRepository)
const chatController = new ChatController(chatInteractor)


const authController = new AuthController(interactor)
const profileController = new ProfileController(interactor, profileInteractor)

/* Auth Routes */
UserRouter.post('/signup', authController.signupUser.bind(authController))
UserRouter.post('/verify-otp', authController.verifyOtp.bind(authController))
UserRouter.post("/resend-otp", authController.resendOTP.bind(authController))
UserRouter.post("/googleAuth", authController.googleAuth.bind(authController))
UserRouter.post("/login", authController.verifyLogin.bind(authController));
UserRouter.post("/confirm-mail", authController.confirmMail.bind(authController));
UserRouter.post("/confirm-mail-otp", authController.confirmMail.bind(authController));
UserRouter.post("/update-password", authController.updatePassword.bind(authController));
UserRouter.post("/refresh-token", authController.refreshAccessToken.bind(authController));
UserRouter.get("/check-username", authController.checkUsername.bind(authController));
UserRouter.post("/update-profile-password", protectUser, authController.updateProfilePassword.bind(authController))

/** */

/* Profile Routes */
UserRouter.patch("/update-user/:id", protectUser, profileController.updateUser.bind(profileController));
UserRouter.post("/upload-url", profileController.generatePresignedUrl.bind(profileController));
UserRouter.post("/update-profile-image", protectUser, profileController.updateProfileImage.bind(profileController));
UserRouter.post("/update-title-image", protectUser, profileController.updateTitleImage.bind(profileController));
/** */

/**Connection routes */
UserRouter.get("/fetch-suggestions", connectionController.fetchSuggestions.bind(connectionController))
UserRouter.get('/searchUsers', protectUser, connectionController.fetchSearchResults.bind(connectionController))
UserRouter.get("/users/:username", protectUser, connectionController.fetchUserDetails.bind(connectionController))
UserRouter.post("/follower/:followerId/user/:userId", protectUser, connectionController.followUser.bind(connectionController))
UserRouter.delete('/follower/:followerId/user/:userId', protectUser, connectionController.unfollowUser.bind(connectionController))
UserRouter.get("/followerStatus/:ownUserId/user/:userId", protectUser, connectionController.getFollowStatus.bind(connectionController))
UserRouter.get("/fetchFollowers/:userId", connectionController.fetchFollowers.bind(connectionController))
UserRouter.get("/fetchFollowing/:userId", connectionController.fetchFollowing.bind(connectionController))
UserRouter.get("/fetch-friend-requests/:userId", protectUser, connectionController.getFollowRequest.bind(connectionController))
UserRouter.post("/accept-friend-request/:requestId", protectUser, connectionController.acceptFriendRequest.bind(connectionController))
UserRouter.post("/reject-friend-request/:requestId", protectUser, connectionController.rejectFriendRequest.bind(connectionController))
/** */

/**Chat routes */
UserRouter.get(`/check-chat/initiator/:initiatorId/recipient/:recipientId`, protectUser, chatController.checkChat.bind(chatController));
UserRouter.post(`/new-chat/initiator/:initiatorId/recipient/:recipientId`, protectUser, chatController.newChat.bind(chatController));
UserRouter.get(`/fetch-conversations/:userId`, protectUser, chatController.fetchConversations.bind(chatController));
UserRouter.get(`/fetch-messages/:chatId`, protectUser, chatController.fetchMessages.bind(chatController));
UserRouter.get(`/fetch-last-message/:chatId`, protectUser, chatController.fetchLastMessage.bind(chatController));
UserRouter.post('/delete-message/:id',protectUser, chatController.deleteMessage.bind(chatController));
UserRouter.get('/fetch-unread-counts/:userId', protectUser, chatController.fetchUnreadCountsController.bind(chatController));

/** */
export default UserRouter