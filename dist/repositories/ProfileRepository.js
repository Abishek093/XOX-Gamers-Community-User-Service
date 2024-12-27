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
exports.ProfileRepository = void 0;
const UserModel_1 = require("../Models/UserModel");
const CustomError_1 = __importDefault(require("../utils/CustomError"));
class ProfileRepository {
    updateUser(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedUser = yield UserModel_1.UserModel.findByIdAndUpdate(userId, updateData, {
                    new: true,
                });
                if (!updatedUser) {
                    throw new CustomError_1.default("User not found", 404);
                }
                return UserModel_1.UserMapper.mapToEntity(updatedUser);
            }
            catch (error) {
                throw new CustomError_1.default("Error updating user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    updateUserProfileImage(userId, profileImageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel_1.UserModel.findByIdAndUpdate(userId, { profileImage: profileImageUrl }, { new: true });
            if (!updatedUser) {
                throw new CustomError_1.default("User not found", 404);
            }
            console.log("Image uploaded successfully for User ID:", userId);
            return profileImageUrl;
        });
    }
    updateUserTitleImage(userId, titleImageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedUser = yield UserModel_1.UserModel.findByIdAndUpdate(userId, { titleImage: titleImageUrl }, { new: true });
            if (!updatedUser) {
                throw new CustomError_1.default("User not found", 404);
            }
            console.log("Title image uploaded successfully for User ID:", userId);
            return titleImageUrl;
        });
    }
}
exports.ProfileRepository = ProfileRepository;
