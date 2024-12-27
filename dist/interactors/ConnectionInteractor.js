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
exports.ConnectionInteractor = void 0;
const FollowModel_1 = require("../Models/FollowModel");
const CustomError_1 = __importDefault(require("../utils/CustomError"));
class ConnectionInteractor {
    constructor(repository) {
        this.repository = repository;
    }
    followUser(followerId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingFollow = yield this.repository.findFollowRequest(followerId, userId);
                if (existingFollow) {
                    if (existingFollow.status === 'Rejected') {
                        existingFollow.status = 'Requested';
                        yield existingFollow.save();
                        return { status: 'Requested', message: 'Follow request sent' };
                    }
                    else {
                        return { status: existingFollow.status, message: 'Follow request already exists' };
                    }
                }
                const follow = new FollowModel_1.Follower({
                    userId,
                    followerId,
                    status: 'Requested'
                });
                yield this.repository.followUser(follow.followerId.toString(), follow.userId.toString(), follow.status);
                return { status: 'Requested', message: 'Follow request sent' };
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
    unfollowUser(userId, followerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.repository.handleUnfollow(userId, followerId);
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
    searchUsers(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.repository.searchUsers(query);
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
    getUserProfile(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.repository.findUserByUsername(username);
                if (user) {
                    return {
                        id: user.id,
                        username: user.userName,
                        displayName: user.displayName,
                        profileImage: user.profileImage,
                        titleImage: user.titleImage,
                        bio: user.bio,
                    };
                }
                return null;
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
    getFollowStatus(ownUserId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.getFollowStatus(ownUserId, userId);
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
    fetchFollowers(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.fetchFollowers(userId);
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
    fetchFollowing(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.fetchFollowing(userId);
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
    getFollowRequests(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.getFollowRequests(userId);
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
    acceptFollowRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followRequest = yield this.repository.getFollowRequestById(requestId);
                if (followRequest) {
                    const { userId, followerId } = followRequest;
                    yield this.repository.acceptFriendRequest(requestId);
                }
                else {
                    throw new CustomError_1.default("Follow request not found", 404);
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
    rejectFollowRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followRequest = yield this.repository.getFollowRequestById(requestId);
                if (followRequest) {
                    const { userId, followerId } = followRequest;
                    yield this.repository.rejectFriendRequest(requestId);
                }
                else {
                    throw new CustomError_1.default("Follow request not found", 404);
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
    handleFetchSuggestions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.repository.handleFetchSuggestions();
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
exports.ConnectionInteractor = ConnectionInteractor;
