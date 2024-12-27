"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secretKey = process.env.JWT_SECRET_KEY;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET_KEY;
if (!secretKey || !refreshTokenSecret) {
    throw new Error('JWT_SECRET_KEY or JWT_REFRESH_SECRET_KEY is not defined in the environment variables');
}
const generateToken = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, secretKey, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, refreshTokenSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, secretKey);
    }
    catch (error) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, refreshTokenSecret);
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
