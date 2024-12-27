"use strict";
// UserInteractor.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInteractor = void 0;
const User_1 = require("../entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const CustomError_1 = __importDefault(require("../utils/CustomError"));
const otp_1 = __importDefault(require("../utils/otp"));
const jwt_1 = require("../utils/jwt");
const crypto_1 = __importDefault(require("crypto"));
const redisClient_1 = __importDefault(require("../services/redisClient"));
class UserInteractor {
    constructor(repository, mailer, broker) {
        this.repository = repository;
        this.mailer = mailer;
        this.broker = broker;
    }
    createUser(userDTO) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield this.repository.findUserByEmail(userDTO.email);
                if (existingUser) {
                    throw new CustomError_1.default("User with this email already exists", 409);
                }
                const existingUserName = yield this.repository.findUserByUsername(userDTO.username);
                if (existingUserName) {
                    throw new CustomError_1.default('Username already exists', 409);
                }
                const hashedPassword = yield bcryptjs_1.default.hash(userDTO.password, 10);
                const user = new User_1.User("", userDTO.username, userDTO.displayName, userDTO.email, hashedPassword, new Date(), new Date(), false, false, false, undefined, undefined, undefined, userDTO.birthDate);
                const createdUser = yield this.repository.signup(user);
                const otp = (0, otp_1.default)();
                yield this.repository.saveOtp(otp, createdUser.id);
                yield this.mailer.SendMail(createdUser.email, { subject: "OTP verification", text: String(otp) });
                return createdUser.id;
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    verifyOtp(otp, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verifiedUser = yield this.repository.verifyOtp(otp, email);
                if (verifiedUser) {
                    const userMessage = {
                        userId: verifiedUser.id,
                        username: verifiedUser.userName,
                        displayName: verifiedUser.displayName,
                        profileImage: verifiedUser.profileImage,
                        isBlocked: verifiedUser.isBlocked
                    };
                    yield this.broker.publishUserCreationMessage(userMessage);
                    yield this.broker.publishStreamingServiceUserCreation(userMessage);
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
                    yield this.broker.PublishUserCreationMessageAdminServices(userMessageToAdminService);
                    yield redisClient_1.default.set(`user:${verifiedUser.id}`, JSON.stringify({
                        userId: verifiedUser.id,
                        email: verifiedUser.email,
                        username: verifiedUser.userName,
                        createdAt: verifiedUser.createdAt,
                        status: "active"
                    }), 'EX', 30 * 24 * 60 * 60 // 30 days in seconds
                    );
                }
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    resendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.repository.findUserByEmail(email);
                if (!user) {
                    throw new CustomError_1.default("User not found", 404);
                }
                const newOtp = (0, otp_1.default)();
                yield this.repository.saveOtp(newOtp, user.id);
                yield this.mailer.SendMail(email, { subject: "Your new otp", text: String(newOtp) });
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    createGoogleUser(email, profileImage, userName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                console.log(email, profileImage, userName);
                const existingUser = yield this.repository.findUserByEmail(email);
                if (existingUser) {
                    if (existingUser.isBlocked) {
                        throw new CustomError_1.default("Account is temporarily blocked!", 403);
                    }
                    if (!existingUser.isGoogleUser) {
                        throw new CustomError_1.default('Please login using your email and password.', 400);
                    }
                    const { accessToken, refreshToken } = (0, jwt_1.generateToken)(existingUser.id);
                    return {
                        accessToken,
                        refreshToken,
                        user: {
                            id: existingUser.id,
                            username: existingUser.userName,
                            displayName: (_a = existingUser.displayName) !== null && _a !== void 0 ? _a : existingUser.userName,
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
                const existingUsername = yield this.repository.findUserByUsername(userName);
                if (existingUsername) {
                    return { isUsernameTaken: true };
                }
                const randomPassword = crypto_1.default.randomBytes(16).toString('hex');
                const hashedPassword = yield bcryptjs_1.default.hash(randomPassword, 10);
                const newUser = new User_1.User("", userName, userName, email, hashedPassword, new Date(), // createdAt
                new Date(), // updatedAt
                false, // isVerified
                true, // isGoogleUser
                false, // isBlocked
                profileImage, // profileImage
                undefined, // titleImage can be set as needed
                undefined, // bio can be set as needed
                undefined);
                const createdUser = yield this.repository.signup(newUser);
                if (createdUser) {
                    const userMessage = {
                        userId: createdUser.id,
                        username: createdUser.userName,
                        displayName: createdUser.displayName,
                        profileImage: createdUser.profileImage,
                        isBlocked: createdUser.isBlocked
                    };
                    yield this.broker.publishUserCreationMessage(userMessage);
                }
                const { accessToken, refreshToken } = (0, jwt_1.generateToken)(createdUser.id);
                return {
                    accessToken,
                    refreshToken,
                    user: {
                        id: createdUser.id,
                        username: createdUser.userName,
                        displayName: (_b = createdUser.displayName) !== null && _b !== void 0 ? _b : '',
                        email: createdUser.email,
                        profileImage: createdUser.profileImage,
                        titleImage: createdUser.titleImage,
                        bio: createdUser.bio,
                    },
                };
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    VerifyUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const existingUser = yield this.repository.findUserByEmail(email);
                if (!existingUser) {
                    throw new CustomError_1.default('User not found. Signup to continue.', 404);
                }
                if (existingUser.isGoogleUser) {
                    throw new CustomError_1.default('Continue signup using Google.', 302);
                }
                if (!bcryptjs_1.default.compareSync(password, existingUser.password)) {
                    throw new CustomError_1.default('Invalid credentials', 401);
                }
                if (existingUser.isBlocked === true) {
                    throw new CustomError_1.default('Account temporarily blocked', 403);
                }
                const { accessToken, refreshToken } = (0, jwt_1.generateToken)(existingUser.id);
                const user = {
                    id: existingUser.id,
                    username: existingUser.userName,
                    displayName: (_a = existingUser.displayName) !== null && _a !== void 0 ? _a : '',
                    email: existingUser.email,
                    profileImage: existingUser.profileImage,
                    titleImage: existingUser.titleImage,
                    bio: existingUser.bio,
                };
                return { user, accessToken, refreshToken };
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    confirmMail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.repository.findUserByEmail(email);
                if (!user) {
                    console.log("User not found");
                    throw new CustomError_1.default("User not found", 404);
                }
                console.log(`User found: ${user.email}`);
                const { isGoogleUser, isVerified, isBlocked } = user;
                if (isGoogleUser) {
                    console.log("Google user detected");
                    throw new CustomError_1.default('Please continue login using Google', 302);
                }
                if (isVerified && !isBlocked) {
                    const userID = user.id;
                    const otp = (0, otp_1.default)();
                    yield this.repository.saveOtp(otp, userID);
                    yield this.mailer.SendMail(email, { subject: "Your otp", text: String(otp) });
                    return;
                }
                else {
                    throw new CustomError_1.default('User is not verified.', 403);
                }
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    verifyConfirmMailOtp(otp, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('otp interactor', otp, email);
                const user = yield this.repository.findUserByEmail(email);
                if (!user) {
                    console.log("User not found");
                    throw new CustomError_1.default("User not found", 404);
                }
                yield this.repository.verifyOtp(otp, email);
                if (!user.isVerified || user.isBlocked === true) {
                    throw new CustomError_1.default("Account is temporarily suspended", 401);
                }
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    updatePassword(newPassword, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.repository.findUserByEmail(email);
                if (!user) {
                    console.log("User not found");
                    throw new CustomError_1.default("User not found", 404);
                }
                if (user.isBlocked || !user.isVerified) {
                    throw new CustomError_1.default('Account is not verified', 403);
                }
                if (user.isGoogleUser) {
                    throw new CustomError_1.default('Cannot update password for Google users', 403);
                }
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
                yield this.repository.updateUserPassword(user.id, hashedPassword);
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
                const { accessToken, refreshToken: newRefreshToken } = (0, jwt_1.generateToken)(decoded.userId);
                return { accessToken, newRefreshToken };
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    updateProfilePassword(email, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.repository.findUserByEmail(email);
                if (!user) {
                    throw new Error('User not found');
                }
                if (user.isBlocked || !user.isVerified) {
                    throw new Error('Account is not verified');
                }
                if (user.isGoogleUser) {
                    throw new Error('Cannot update password for Google users');
                }
                yield this.repository.updateProfilePassword(user.id, currentPassword, newPassword);
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    checkUserName(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUsername = yield this.repository.findUserByUsername(username);
                return !!existingUsername;
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
    blockUnblockUser(userId, isBlocked) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.repository.blockUnblockUser(userId, isBlocked);
            }
            catch (error) {
                if (error instanceof CustomError_1.default) {
                    throw error;
                }
                else {
                    console.error(error);
                    throw new CustomError_1.default("Internal Server Error", 500);
                }
            }
        });
    }
}
exports.UserInteractor = UserInteractor;
