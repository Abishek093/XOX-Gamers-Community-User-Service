export type AuthenticatedUser = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        displayName?: string;
        email: string;
        profileImage?: string;
        titleImage?: string;
        bio?: string;
    };
};

export type UsernameTakenResponse = {
    isUsernameTaken: boolean;
};

export type AuthResponse = AuthenticatedUser | UsernameTakenResponse;

export type NonSensitiveUserProps = {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    profileImage?: string;
    titleImage?: string;
    bio?: string;
    dateOfBirth?: Date;
};

export type UserDetails = {
    id: string;
    username: string;
    displayName?: string;
    profileImage?: string;
    titleImage?: string;
    bio?: string;
}

export type UserProps = {
    id?: string;
    email: string;
    username: string;
    displayName?: string;
    password: string;
    profileImage?: string;
    titleImage?: string;
    bio?: string;
    // followers?: string[];
    // following?: string[];
    walletBalance?: number;
    transactions?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    isVerified?: boolean;
    isGoogleUser?: boolean;
    dateOfBirth?: Date;
    isBlocked?: boolean;
}


export type PublishUserData = {
    userId: string,
    username: string,
    displayName: string,
    profileImage?: string,
    isBlocked?: boolean;
}

export type PublishProfileImageUpdate = {
    userId: string,
    profileImage?: string
}

export type userMessageToAdminService = {
    _id: string
    email: string;
    username: string;
    displayName: string
    dateOfBirth?: Date;
    profileImage?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
    isVerified: boolean;
    isGoogleUser: boolean;
    isBlocked: boolean;
}

import { ObjectId } from 'mongodb'; 

export interface PopulatedMessage {
    chatId: ObjectId;
    sender: {
      _id: ObjectId;
      displayName: string;
      profileImage: string;
    };
    content: string;
    media: { type: "image" | "video" | "audio" | "pdf" | "gif"; url: string }[]; // Updated
    repliedTo: ObjectId | null;
    seen: boolean;
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
  }
  
