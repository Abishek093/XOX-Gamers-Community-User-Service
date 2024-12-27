"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const UserRepository_1 = require("../repositories/UserRepository");
const UserInteractor_1 = require("../interactors/UserInteractor");
const mailer_1 = require("../external-libraries/mailer");
const messageBroker_1 = require("../external-libraries/messageBroker");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const ProfileRepository_1 = require("../repositories/ProfileRepository");
const ProfileInteractor_1 = require("../interactors/ProfileInteractor");
const ProfileController_1 = require("../controllers/ProfileController");
const ConnectionRepository_1 = require("../repositories/ConnectionRepository");
const ConnectionInteractor_1 = require("../interactors/ConnectionInteractor");
const ConnectionController_1 = require("../controllers/ConnectionController");
const UserRouter = (0, express_1.Router)();
const userRepository = new UserRepository_1.UserRepository();
const profileRepository = new ProfileRepository_1.ProfileRepository();
const mailer = new mailer_1.Mailer();
const broker = new messageBroker_1.MessageBroker();
const interactor = new UserInteractor_1.UserInteractor(userRepository, mailer, broker);
const profileInteractor = new ProfileInteractor_1.ProfileInteractor(userRepository, profileRepository, broker);
const connectionRepository = new ConnectionRepository_1.ConnectionRepository();
const connectionInteractor = new ConnectionInteractor_1.ConnectionInteractor(connectionRepository);
const connectionController = new ConnectionController_1.ConnectionController(connectionInteractor);
const authController = new AuthController_1.AuthController(interactor);
const profileController = new ProfileController_1.ProfileController(interactor, profileInteractor);
/* Auth Routes */
UserRouter.post('/signup', authController.signupUser.bind(authController));
UserRouter.post('/verify-otp', authController.verifyOtp.bind(authController));
UserRouter.post("/resend-otp", authController.resendOTP.bind(authController));
UserRouter.post("/googleAuth", authController.googleAuth.bind(authController));
UserRouter.post("/login", authController.verifyLogin.bind(authController));
UserRouter.post("/confirm-mail", authController.confirmMail.bind(authController));
UserRouter.post("/confirm-mail-otp", authController.confirmMail.bind(authController));
UserRouter.post("/update-password", authController.updatePassword.bind(authController));
UserRouter.post("/refresh-token", authController.refreshAccessToken.bind(authController));
UserRouter.get("/check-username", authController.checkUsername.bind(authController));
UserRouter.post("/update-profile-password", authMiddleware_1.protectUser, authController.updateProfilePassword.bind(authController));
/** */
/* Profile Routes */
UserRouter.patch("/update-user/:id", authMiddleware_1.protectUser, profileController.updateUser.bind(profileController));
UserRouter.post("/upload-url", profileController.generatePresignedUrl.bind(profileController));
UserRouter.post("/update-profile-image", authMiddleware_1.protectUser, profileController.updateProfileImage.bind(profileController));
UserRouter.post("/update-title-image", authMiddleware_1.protectUser, profileController.updateTitleImage.bind(profileController));
/** */
/**Connection routes */
UserRouter.get("/fetch-suggestions", authMiddleware_1.protectUser, connectionController.fetchSuggestions.bind(connectionController));
UserRouter.get('/searchUsers', authMiddleware_1.protectUser, connectionController.fetchSearchResults.bind(connectionController));
UserRouter.get("/users/:username", authMiddleware_1.protectUser, connectionController.fetchUserDetails.bind(connectionController));
UserRouter.post("/follower/:followerId/user/:userId", authMiddleware_1.protectUser, connectionController.followUser.bind(connectionController));
UserRouter.delete('/follower/:followerId/user/:userId', authMiddleware_1.protectUser, connectionController.unfollowUser.bind(connectionController));
UserRouter.get("/followerStatus/:ownUserId/user/:userId", authMiddleware_1.protectUser, connectionController.getFollowStatus.bind(connectionController));
UserRouter.get("/fetchFollowers/:userId", connectionController.fetchFollowers.bind(connectionController));
UserRouter.get("/fetchFollowing/:userId", connectionController.fetchFollowing.bind(connectionController));
UserRouter.get("/fetch-friend-requests/:userId", authMiddleware_1.protectUser, connectionController.getFollowRequest.bind(connectionController));
UserRouter.post("/accept-friend-request/:requestId", authMiddleware_1.protectUser, connectionController.acceptFriendRequest.bind(connectionController));
UserRouter.post("/reject-friend-request/:requestId", authMiddleware_1.protectUser, connectionController.rejectFriendRequest.bind(connectionController));
/** */
exports.default = UserRouter;
