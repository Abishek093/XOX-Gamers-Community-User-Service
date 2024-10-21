import { IConnectionInteractor } from "../interfaces/IConnectionInteractor";
import { Follower } from "../Models/FollowModel";
import { ConnectionRepository } from "../repositories/ConnectionRepository";
import CustomError from "../utils/CustomError";

export class ConnectionInteractor implements IConnectionInteractor {
    constructor(private repository: ConnectionRepository) { }

    async followUser(followerId: string, userId: string): Promise<{ status: string, message: string }> {
        try {
            const existingFollow = await this.repository.findFollowRequest(followerId, userId);
            if (existingFollow) {
                if (existingFollow.status === 'Rejected') {
                    existingFollow.status = 'Requested';
                    await existingFollow.save();
                    return { status: 'Requested', message: 'Follow request sent' };
                } else {
                    return { status: existingFollow.status, message: 'Follow request already exists' };
                }
            }

            const follow = new Follower({
                userId,
                followerId,
                status: 'Requested'
            });

            await this.repository.followUser(follow.followerId.toString(), follow.userId.toString(), follow.status);
            return { status: 'Requested', message: 'Follow request sent' };

        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }


    async unfollowUser(userId: string, followerId: string): Promise<void> {
        try {
            const result = await this.repository.handleUnfollow(userId, followerId)
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                console.error(error);
                throw new CustomError("Internal Server Error", 500);
            }
        }
    }
}