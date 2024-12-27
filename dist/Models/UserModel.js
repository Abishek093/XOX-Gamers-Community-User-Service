"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const User_1 = require("../entities/User");
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    displayName: { type: String },
    dateOfBirth: { type: Date },
    password: { type: String, required: true },
    profileImage: { type: String },
    titleImage: { type: String },
    bio: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    isGoogleUser: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }
});
// Exporting the User model directly
exports.UserModel = mongoose_1.default.model('User', UserSchema);
// Utility function to map user document to entity
class UserMapper {
    static mapToEntity(userDoc) {
        return new User_1.User(String(userDoc._id), userDoc.username, userDoc.displayName, userDoc.email, userDoc.password, userDoc.createdAt, userDoc.updatedAt, userDoc.isVerified, userDoc.isGoogleUser, userDoc.isBlocked, userDoc.profileImage, userDoc.titleImage, userDoc.bio, userDoc.dateOfBirth);
    }
}
exports.UserMapper = UserMapper;
