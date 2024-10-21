import { IConnectionRepository } from "../interfaces/IConnectionRepository";
import { Follower, IFollower } from "../Models/FollowModel";
import CustomError from "../utils/CustomError";

export class ConnectionRepository implements IConnectionRepository {
    async findFollowRequest(followerId: string, userId: string): Promise<IFollower | null> {
        try {
            return Follower.findOne({ userId, followerId });
        } catch (error) {
            throw new CustomError("Error finding follow request: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async followUser(followerId: string, userId: string, status: string): Promise<void> {
        try {
            const existingFollow = await Follower.findOne({
                userId: userId,
                followerId: followerId,
              });
              if (existingFollow) {
                existingFollow.status = "Requested";
              } else {
                const follow = new Follower({
                  userId,
                  followerId,
                  status: status,
                });
                await follow.save();
              }
        } catch (error) {
            throw new CustomError("Error following user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
    }

    async handleUnfollow(userId: string, followerId: string): Promise<void> {
        try {

            const unfollow  = await Follower.findOneAndDelete({ userId, followerId });
            if(!unfollow){
                throw new CustomError("unable to find the follow",404)
            }
        } catch (error) {
            throw new CustomError("Error unfollowing user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
        }
      }
    
}