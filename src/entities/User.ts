import { NonSensitiveUserProps } from "./Types";

export class User {
    constructor(
        public readonly id: string,
        public readonly userName: string,
        public readonly displayName: string,
        public readonly email: string,
        public readonly password: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly isVerified: boolean,
        public readonly isGoogleUser: boolean,
        public readonly isBlocked: boolean,
        public readonly profileImage?: string,
        public readonly titleImage?: string,
        public readonly bio?: string,
        public readonly dateOfBirth?: Date,
    ) {}

    public getNonSensitiveUserProps(): NonSensitiveUserProps {
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
