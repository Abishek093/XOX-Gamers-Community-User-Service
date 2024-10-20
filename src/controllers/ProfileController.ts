import { NextFunction, Request, Response } from "express";
import { IUserInteractor } from "../interfaces/IUserInteractor";
import { IProfileInteractor } from "../interfaces/IProfileInteractor";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class ProfileController {
    private userInteractor: IUserInteractor;
    private profileInteractor: IProfileInteractor

    constructor(userInteractor: IUserInteractor, profileInteractor: IProfileInteractor) {
        this.userInteractor = userInteractor;
        this.profileInteractor = profileInteractor
    }

    updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            console.log("updateData user profile controller 13", updateData)
            const updatedUser = await this.profileInteractor.updateUser(id, updateData);
            res.status(200).json({ success: true, user: updatedUser });
        } catch (error) {
            console.log("Profile controller update user error", error)
            next(error)
        }
    }

    updateProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId, profileImageUrl } = req.body;
            console.log("Request body:", { userId, profileImageUrl });
            const updatedProfileImageUrl = await this.profileInteractor.updateUserProfileImage(userId, profileImageUrl);
            res.status(200).json({ profileImageUrl: updatedProfileImageUrl });
        } catch (error) {
            next(error);
        }
    }

    updateTitleImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
          const { userId, titleImageUrl } = req.body;
          console.log("Request body:", { userId, titleImageUrl });
          const updatedTitleImageUrl = await this.profileInteractor.updateUserTitleImage(userId, titleImageUrl);
          res.status(200).json({ titleImageUrl: updatedTitleImageUrl });
        } catch (error) {
          next(error);
        }
      }
      

      generatePresignedUrl = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId, fileType } = req.body;
            if (!userId) {
                res.status(400).json({ message: 'UserId is required' });
                return;
            }
    
            const region = process.env.AWS_REGION;
            const bucket = process.env.AWS_BUCKET_NAME;
    
            // Initialize S3Client here
            const s3Client = new S3Client({ region });
    
            // Ensure distinct key generation
            const key = `${userId}-${fileType}.jpg`; // Either 'profile' or 'title' is passed as fileType.
    
            const params = {
                Bucket: bucket,
                Key: key,
                ContentType: 'image/jpeg',
            };
    
            // Use the correct S3Client instance
            const command = new PutObjectCommand(params);
            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
    
            res.status(200).json({ uploadUrl: signedUrl, key });
        } catch (error) {
            console.error("Error generating pre-signed URL", error);
            res.status(500).json({ message: 'Failed to generate pre-signed URL' });
        }
    };
    


}
