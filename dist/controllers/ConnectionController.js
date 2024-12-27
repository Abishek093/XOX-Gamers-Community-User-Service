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
exports.ConnectionController = void 0;
const CustomError_1 = __importDefault(require("../utils/CustomError"));
class ConnectionController {
    constructor(interarctor) {
        this.interarctor = interarctor;
        this.followUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { followerId, userId } = req.params;
            try {
                const result = yield this.interarctor.followUser(followerId, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.unfollowUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { followerId, userId } = req.params;
            try {
                yield this.interarctor.unfollowUser(userId, followerId);
                res.status(200).json({ message: "Unfollowed successfully" });
            }
            catch (error) {
                next(error);
            }
        });
        this.fetchSearchResults = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const query = req.query.query;
            console.log(query);
            if (!query) {
                throw new CustomError_1.default("Query parameter is required", 400);
            }
            try {
                const results = yield this.interarctor.searchUsers(query);
                res.status(200).json({ results });
            }
            catch (error) {
                next(error);
            }
        });
        this.fetchUserDetails = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { username } = req.params;
            try {
                const user = yield this.interarctor.getUserProfile(username);
                res.status(200).json(user);
            }
            catch (error) {
                next(error);
            }
        });
        this.getFollowStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { ownUserId, userId } = req.params;
            try {
                const status = yield this.interarctor.getFollowStatus(ownUserId, userId);
                res.status(200).json({ status });
            }
            catch (error) {
                next(error);
            }
        });
        this.fetchFollowers = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const followers = yield this.interarctor.fetchFollowers(userId);
                res.status(200).json(followers);
            }
            catch (error) {
                next(error);
            }
        });
        this.fetchFollowing = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const following = yield this.interarctor.fetchFollowing(userId);
                res.status(200).json(following);
            }
            catch (error) {
                next(error);
            }
        });
        this.getFollowRequest = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            try {
                const requests = yield this.interarctor.getFollowRequests(userId);
                res.status(200).json(requests);
            }
            catch (error) {
                next(error);
            }
        });
        this.acceptFriendRequest = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { requestId } = req.params;
                yield this.interarctor.acceptFollowRequest(requestId);
                res.status(200).json({ message: "Friend request accepted" });
            }
            catch (error) {
                next(error);
            }
        });
        this.rejectFriendRequest = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { requestId } = req.params;
                const response = yield this.interarctor.rejectFollowRequest(requestId);
                res.status(200).json(response);
            }
            catch (error) {
                next(error);
            }
        });
        this.fetchSuggestions = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const suggestions = yield this.interarctor.handleFetchSuggestions();
                res.status(200).json({ results: suggestions });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ConnectionController = ConnectionController;
