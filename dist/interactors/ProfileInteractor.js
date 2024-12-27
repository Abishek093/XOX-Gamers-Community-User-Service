"use strict";
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
exports.ProfileInteractor = void 0;
const console_1 = require("console");
const CustomError_1 = __importDefault(require("../utils/CustomError"));
class ProfileInteractor {
    constructor(userRepository, profileRepository, broker) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.broker = broker;
    }
    updateUser(userId, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, console_1.log)("UpdateUserUseCase", userData, userId);
                if (!userData.username || userData.username.trim() === '') {
                    throw new CustomError_1.default('Username should not be empty', 400);
                }
                const updatedUser = yield this.profileRepository.updateUser(userId, userData);
                if (updatedUser) {
                    if (userData.username || userData.displayName) {
                        const message = {
                            userId: updatedUser.id,
                            username: updatedUser.userName,
                            displayName: updatedUser.displayName,
                            profileImage: updatedUser.profileImage,
                            isBlocked: updatedUser.isBlocked
                        };
                        try {
                            yield this.broker.publishProfileUpdateMessage(message);
                            console.log("User update data published to queue:", message);
                        }
                        catch (error) {
                            console.error("Failed to publish update message to queue via CircuitBreaker:", error);
                        }
                    }
                    return {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        username: updatedUser.userName,
                        displayName: updatedUser.displayName,
                        profileImage: updatedUser.profileImage,
                        titleImage: updatedUser.titleImage,
                        bio: updatedUser.bio,
                        dateOfBirth: updatedUser.dateOfBirth
                    };
                }
                else {
                    throw new CustomError_1.default("Failed to update user!", 500);
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
    updateUserProfileImage(userId, profileImage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("User ID:", userId, "Profile Image URL:", profileImage);
                if (!profileImage) {
                    throw new CustomError_1.default('Profile image data is missing', 400);
                }
                const updatedProfileImageUrl = yield this.profileRepository.updateUserProfileImage(userId, profileImage);
                if (updatedProfileImageUrl) {
                    yield this.broker.publishProfileImageUpdateMessage({
                        userId: userId,
                        profileImage: updatedProfileImageUrl,
                    });
                }
                return updatedProfileImageUrl;
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
    updateUserTitleImage(userId, titleImage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("User ID:", userId, "Title Image URL:", titleImage);
                if (!titleImage) {
                    throw new CustomError_1.default('Title image data is missing', 400);
                }
                const updatedTitleImageUrl = yield this.profileRepository.updateUserTitleImage(userId, titleImage);
                return updatedTitleImageUrl;
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
exports.ProfileInteractor = ProfileInteractor;
