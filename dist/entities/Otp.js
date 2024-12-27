"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
class Otp {
    constructor(otp, userId, createdAt) {
        this.otp = otp;
        this.userId = userId;
        this.createdAt = createdAt;
    }
}
exports.Otp = Otp;
