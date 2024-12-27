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
exports.ConnectionRepository = void 0;
const FollowModel_1 = require("../Models/FollowModel");
const UserModel_1 = require("../Models/UserModel");
const CustomError_1 = __importDefault(require("../utils/CustomError"));
class ConnectionRepository {
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
    findFollowRequest(followerId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(FollowModel_1.Follower.findOne({ userId, followerId }));
                return FollowModel_1.Follower.findOne({ userId, followerId });
            }
            catch (error) {
                throw new CustomError_1.default("Error finding follow request: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    followUser(followerId, userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingFollow = yield FollowModel_1.Follower.findOne({
                    userId: userId,
                    followerId: followerId,
                });
                if (existingFollow) {
                    existingFollow.status = "Requested";
                }
                else {
                    const follow = new FollowModel_1.Follower({
                        userId,
                        followerId,
                        status: status,
                    });
                    yield follow.save();
                }
            }
            catch (error) {
                throw new CustomError_1.default("Error following user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    handleUnfollow(userId, followerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const unfollow = yield FollowModel_1.Follower.findOneAndDelete({ userId, followerId });
                if (!unfollow) {
                    throw new CustomError_1.default("unable to find the follow", 404);
                }
            }
            catch (error) {
                throw new CustomError_1.default("Error unfollowing user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    searchUsers(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const regexPattern = query.replace(/[\W_]+/g, '.*');
                const regex = new RegExp(`^${regexPattern}`, 'i');
                const matchedUsers = yield UserModel_1.UserModel.find({
                    $or: [
                        { username: { $regex: regex } },
                        { displayName: { $regex: regex } }
                    ]
                });
                console.log(matchedUsers);
                return matchedUsers.map(user => ({
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    profileImage: user.profileImage || ''
                }));
            }
            catch (error) {
                throw new CustomError_1.default("Error searching users: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    getFollowStatus(ownUserId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const follow = yield FollowModel_1.Follower.findOne({ userId, followerId: ownUserId });
                return follow ? follow.status : "NotFollowing";
            }
            catch (error) {
                throw new CustomError_1.default("Error getting follow status: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    fetchFollowers(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const followers = yield FollowModel_1.Follower.find({ userId, status: 'Accepted' }).populate("followerId");
                return followers;
            }
            catch (error) {
                throw new CustomError_1.default("Error fetching followers: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    fetchFollowing(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const following = yield FollowModel_1.Follower.find({ followerId: userId, status: 'Accepted' }).populate("userId");
                return following;
            }
            catch (error) {
                throw new CustomError_1.default("Error fetching following: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    getFollowRequests(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requests = yield FollowModel_1.Follower.find({
                    userId: userId,
                    status: "Requested",
                });
                console.log("requests repository: ", requests);
                const usersWithDetails = yield Promise.all(requests.map((request) => __awaiter(this, void 0, void 0, function* () {
                    const userDetails = yield UserModel_1.UserModel.findById(request.followerId, {
                        username: 1,
                        displayName: 1,
                        profileImage: 1,
                    }).lean();
                    return Object.assign(Object.assign({}, request.toObject()), { userDetails: userDetails || null });
                })));
                console.log("usersWithDetails: ", usersWithDetails);
                return usersWithDetails;
            }
            catch (error) {
                throw new CustomError_1.default("Error fetching follow requests: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    getFollowRequestById(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield FollowModel_1.Follower.findById(requestId).select('userId followerId');
            }
            catch (error) {
                throw new CustomError_1.default("Error finding follow request: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    acceptFriendRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield FollowModel_1.Follower.findByIdAndUpdate(requestId, { status: "Accepted" });
            }
            catch (error) {
                throw new CustomError_1.default("Error accept follow requests: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    rejectFriendRequest(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield FollowModel_1.Follower.findByIdAndUpdate(requestId, { status: "Rejected" });
            }
            catch (error) {
                throw new CustomError_1.default("Error reject follow requests: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
    handleFetchSuggestions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const suggestions = yield UserModel_1.UserModel.find()
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .select('id username displayName profileImage');
                return suggestions;
            }
            catch (error) {
                throw new CustomError_1.default("Error fetching suggestions: " + (error instanceof Error ? error.message : "Unknown error"), 500);
            }
        });
    }
}
exports.ConnectionRepository = ConnectionRepository;
