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
exports.UserRepository = void 0;
const OtpModel_1 = __importDefault(require("../Models/OtpModel"));
const UserModel_1 = require("../Models/UserModel");
const CustomError_1 = __importDefault(require("../utils/CustomError"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserRepository {
    signup(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newUser = new UserModel_1.UserModel({
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
                yield newUser.save();
                return UserModel_1.UserMapper.mapToEntity(newUser);
            }
            catch (error) {
                throw new CustomError_1.default("Error signing up user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userDoc = yield UserModel_1.UserModel.findOne({ email }).exec();
                return userDoc ? UserModel_1.UserMapper.mapToEntity(userDoc) : null;
            }
            catch (error) {
                throw new CustomError_1.default("Error finding user by email: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    findUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userDoc = yield UserModel_1.UserModel.findOne({ username }).exec();
                return userDoc ? UserModel_1.UserMapper.mapToEntity(userDoc) : null;
            }
            catch (error) {
                throw new CustomError_1.default("Error finding user by username: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    saveOtp(otp, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const otpEntry = new OtpModel_1.default({
                    otp: otp,
                    userId: userId,
                    createdAt: new Date(),
                });
                yield otpEntry.save();
            }
            catch (error) {
                throw new CustomError_1.default("Error saving OTP: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    verifyOtp(otp, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Otp in repository', otp, email);
                const user = yield this.findUserByEmail(email);
                if (!user) {
                    throw new CustomError_1.default('Failed to verify the user.', 404);
                }
                const otpDetails = yield OtpModel_1.default.findOne({ userId: user.id }).sort({ createdAt: -1 }).limit(1);
                console.log("otpDetails", otpDetails);
                if (!otpDetails) {
                    throw new CustomError_1.default('Otp time has expired! Try resend Otp.', 410);
                }
                if (otpDetails.otp !== parseInt(otp)) {
                    throw new CustomError_1.default('Invalid otp!', 400);
                }
                const verifiedUser = yield this.verifyUser(user.id);
                return verifiedUser;
            }
            catch (error) {
                throw new CustomError_1.default("Error verifying OTP: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    verifyUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield UserModel_1.UserModel.findById(userId);
                if (!existingUser) {
                    throw new CustomError_1.default("User not found", 404);
                }
                existingUser.isVerified = true;
                yield existingUser.save();
                return UserModel_1.UserMapper.mapToEntity(existingUser);
            }
            catch (error) {
                throw new CustomError_1.default("Error verifying user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    updateUserPassword(userId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield UserModel_1.UserModel.findByIdAndUpdate(userId, { password: newPassword });
            }
            catch (error) {
                throw new CustomError_1.default("Failed to update password" + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    updateProfilePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserModel_1.UserModel.findById(userId);
                if (!user) {
                    throw new Error("User not found");
                }
                const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
                if (!isMatch) {
                    throw new Error("Current password is incorrect");
                }
                const salt = yield bcryptjs_1.default.genSalt(10);
                const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
                yield UserModel_1.UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
                console.log("Password updated successfully");
            }
            catch (error) {
                throw new CustomError_1.default("Failed to update password" + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    blockUnblockUser(userId, isBlocked) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield UserModel_1.UserModel.findById(userId);
                if (!user) {
                    throw new CustomError_1.default('User not found', 404);
                }
                user.isBlocked = isBlocked;
                yield user.save();
            }
            catch (error) {
                throw new CustomError_1.default("Error while Blocking/Unblocking users: " + (error instanceof Error || error instanceof CustomError_1.default ? error.message : "Unknown error"), 500);
            }
        });
    }
}
exports.UserRepository = UserRepository;
