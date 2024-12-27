"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, userName, displayName, email, password, createdAt, updatedAt, isVerified, isGoogleUser, isBlocked, profileImage, titleImage, bio, dateOfBirth) {
        this.id = id;
        this.userName = userName;
        this.displayName = displayName;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isVerified = isVerified;
        this.isGoogleUser = isGoogleUser;
        this.isBlocked = isBlocked;
        this.profileImage = profileImage;
        this.titleImage = titleImage;
        this.bio = bio;
        this.dateOfBirth = dateOfBirth;
    }
    getNonSensitiveUserProps() {
        return {
            id: this.id,
            email: this.email,
            username: this.userName,
            displayName: this.displayName,
            profileImage: this.profileImage,
            titleImage: this.titleImage,
            bio: this.bio,
            dateOfBirth: this.dateOfBirth,
        };
    }
}
exports.User = User;
