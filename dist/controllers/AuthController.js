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
exports.AuthController = void 0;
const UserSignupDTO_1 = require("../entities/UserSignupDTO");
const ResponseHandler_1 = require("../utils/ResponseHandler");
const CustomError_1 = __importDefault(require("../utils/CustomError"));
class AuthController {
    constructor(interactor) {
        this.verifyOtp = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { otp, email } = req.body;
                console.log('otp from body', otp, email);
                yield this.interactor.verifyOtp(otp, email);
                return (0, ResponseHandler_1.handleResponse)(res, 200, 'User verified successfully');
            }
            catch (error) {
                next(error);
            }
        });
        this.resendOTP = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this.interactor.resendOtp(email);
                (0, ResponseHandler_1.handleResponse)(res, 200, 'Otp send successfully');
            }
            catch (error) {
                next(error);
            }
        });
        this.googleAuth = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, profileImage } = req.body;
                console.log("auth controller", username, email, profileImage);
                const response = yield this.interactor.createGoogleUser(email, profileImage, username);
                if ('isUsernameTaken' in response) {
                    (0, ResponseHandler_1.handleResponse)(res, 200, response);
                }
                else {
                    const { accessToken, refreshToken, user } = response;
                    // handleResponse(res, 200, { accessToken, refreshToken, user });
                    res.status(200).json({ accessToken, refreshToken, user });
                }
            }
            catch (error) {
                if (error instanceof CustomError_1.default && error.message === 'Username already exists') {
                    (0, ResponseHandler_1.handleResponse)(res, 200, { isUsernameTaken: true });
                }
                else {
                    next(error);
                }
            }
        });
        this.verifyLogin = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const authenticatedUser = yield this.interactor.VerifyUser(email, password);
                res.status(200).json(authenticatedUser);
            }
            catch (error) {
                next(error);
            }
        });
        this.confirmMail = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this.interactor.confirmMail(email);
                res.status(200).json({ success: true, message: 'Mail confirmed successfully.', email: email });
            }
            catch (error) {
                next(error);
            }
        });
        this.verifyConfirmMailOtp = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { otp, email } = req.body;
                console.log('otp from body', otp, email);
                yield this.interactor.verifyConfirmMailOtp(otp, email);
                res.status(200).json({ success: true, message: 'Mail confirmed successfully.', email });
            }
            catch (error) {
                next(error);
            }
        });
        this.updatePassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newPassword } = req.body;
                console.log("Auth controller", email, newPassword);
                yield this.interactor.updatePassword(newPassword, email);
                res.status(200).json({ message: 'Password updated successfully' });
            }
            catch (error) {
                console.error('Update password failed:', error);
                next(error);
            }
        });
        this.refreshAccessToken = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { refreshToken } = req.body;
            try {
                const { accessToken, newRefreshToken } = yield this.interactor.refreshAccessToken(refreshToken);
                res.status(200).json({ accessToken, refreshToken: newRefreshToken });
            }
            catch (error) {
                next(error);
            }
        });
        this.updateProfilePassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { email, currentPassword, newPassword } = req.body;
            try {
                yield this.interactor.updateProfilePassword(email, currentPassword, newPassword);
                res.status(200).json({ status: 200, message: 'Password updated successfully' });
            }
            catch (error) {
                next(error);
            }
        });
        this.checkUsername = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const username = req.query.username;
                if (typeof username !== 'string') {
                    throw new CustomError_1.default('Invalid username', 400);
                }
                const isAvailable = yield this.interactor.checkUserName(username);
                res.status(200).json({ available: !isAvailable });
            }
            catch (error) {
                console.error("Error checking username availability: ", error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
        this.interactor = interactor;
    }
    signupUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, username, displayName, birthDate, password } = req.body;
                console.log(req.body);
                console.log(email, username, displayName, birthDate, password);
                const userDTO = new UserSignupDTO_1.UserSignupDTO(username, email, displayName, password, birthDate);
                const createdUser = yield this.interactor.createUser(userDTO);
                console.log("cretated user", createdUser);
                // res.status(201).json({
                //     message: "User created successfully",
                //     data: createdUser,
                // });
                (0, ResponseHandler_1.handleResponse)(res, 201, createdUser);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AuthController = AuthController;
