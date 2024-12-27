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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
class ProfileController {
    constructor(userInteractor, profileInteractor) {
        this.updateUser = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const updateData = req.body;
                console.log("updateData user profile controller 13", updateData);
                const updatedUser = yield this.profileInteractor.updateUser(id, updateData);
                res.status(200).json({ success: true, user: updatedUser });
            }
            catch (error) {
                console.log("Profile controller update user error", error);
                next(error);
            }
        });
        this.updateProfileImage = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, profileImageUrl } = req.body;
                console.log("Request body:", { userId, profileImageUrl });
                const updatedProfileImageUrl = yield this.profileInteractor.updateUserProfileImage(userId, profileImageUrl);
                res.status(200).json({ profileImageUrl: updatedProfileImageUrl });
            }
            catch (error) {
                next(error);
            }
        });
        this.updateTitleImage = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, titleImageUrl } = req.body;
                console.log("Request body:", { userId, titleImageUrl });
                const updatedTitleImageUrl = yield this.profileInteractor.updateUserTitleImage(userId, titleImageUrl);
                res.status(200).json({ titleImageUrl: updatedTitleImageUrl });
            }
            catch (error) {
                next(error);
            }
        });
        this.generatePresignedUrl = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, fileType } = req.body;
                if (!userId) {
                    res.status(400).json({ message: 'UserId is required' });
                    return;
                }
                const region = process.env.AWS_REGION;
                const bucket = process.env.AWS_BUCKET_NAME;
                // Initialize S3Client here
                const s3Client = new client_s3_1.S3Client({ region });
                // Ensure distinct key generation
                const key = `${userId}-${fileType}.jpg`; // Either 'profile' or 'title' is passed as fileType.
                const params = {
                    Bucket: bucket,
                    Key: key,
                    ContentType: 'image/jpeg',
                };
                // Use the correct S3Client instance
                const command = new client_s3_1.PutObjectCommand(params);
                const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 600 });
                res.status(200).json({ uploadUrl: signedUrl, key });
            }
            catch (error) {
                console.error("Error generating pre-signed URL", error);
                res.status(500).json({ message: 'Failed to generate pre-signed URL' });
            }
        });
        this.userInteractor = userInteractor;
        this.profileInteractor = profileInteractor;
    }
}
exports.ProfileController = ProfileController;
