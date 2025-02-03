import { User } from "../entities/User";
import { IConnectionRepository } from "../interfaces/IConnectionRepository";
import { Follower, IFollower, IFollowerWithDetails } from "../Models/FollowModel";
import { IUser, UserMapper, UserModel } from "../Models/UserModel";
import CustomError from "../utils/CustomError";

export class ConnectionRepository implements IConnectionRepository {
   async findUserByUsername(username: string): Promise<User | null> {
      try {
         const userDoc = await UserModel.findOne({ username }).exec();
         return userDoc ? UserMapper.mapToEntity(userDoc) : null;
      } catch (error) {
         throw new CustomError("Error finding user by username: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
   }

   async findFollowRequest(followerId: string, userId: string): Promise<IFollower | null> {
      try {
         console.log(Follower.findOne({ userId, followerId }))
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

         const unfollow = await Follower.findOneAndDelete({ userId, followerId });
         if (!unfollow) {
            throw new CustomError("unable to find the follow", 404)
         }
      } catch (error) {
         throw new CustomError("Error unfollowing user: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
   }


   async searchUsers(query: string): Promise<{ id: string; username: string; displayName: string; profileImage: string }[]> {
      try {
         const regexPattern = query.replace(/[\W_]+/g, '.*');
         const regex = new RegExp(`^${regexPattern}`, 'i');

         const matchedUsers = await UserModel.find({
            $or: [
               { username: { $regex: regex } },
               { displayName: { $regex: regex } }
            ]
         });
         console.log(matchedUsers)
         return matchedUsers.map(user => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            profileImage: user.profileImage || ''
         }));
      } catch (error) {
         throw new CustomError("Error searching users: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
   }

   async getFollowStatus(ownUserId: string, userId: string): Promise<string> {
      try {
         const follow = await Follower.findOne({ userId, followerId: ownUserId });
         return follow ? follow.status : "NotFollowing";
      } catch (error) {
         throw new CustomError("Error getting follow status: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
   }

   async fetchFollowers(userId: string): Promise<IFollower[]> {
      try {
         const followers = await Follower.find({ userId, status: 'Accepted' }).populate("followerId");
         return followers as IFollower[];
      } catch (error) {
         throw new CustomError("Error fetching followers: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
   }

   async fetchFollowing(userId: string): Promise<IFollower[]> {
      try {
         const following = await Follower.find({ followerId: userId, status: 'Accepted' }).populate(
            "userId"
         );
         return following as IFollower[];
      } catch (error) {
         throw new CustomError("Error fetching following: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
   }

   async getFollowRequests(userId: string): Promise<IFollowerWithDetails[]> {
      try {
         const requests = await Follower.find({
            userId: userId,
            status: "Requested",
         });
         console.log("requests repository: ",requests)
         const usersWithDetails = await Promise.all(
            requests.map(async (request) => {
               const userDetails = await UserModel.findById(request.followerId, {
                  username: 1,
                  displayName: 1,
                  profileImage: 1,
               }).lean();

               return {
                  ...request.toObject(),
                  userDetails: userDetails || null,
               } as IFollowerWithDetails;
            })
         );
         console.log("usersWithDetails: ",usersWithDetails)

         return usersWithDetails;
      } catch (error) {
         throw new CustomError("Error fetching follow requests: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
   }

   async getFollowRequestById(requestId: string): Promise<{ userId: string, followerId: string } | null> {
      try {
         return await Follower.findById(requestId).select('userId followerId');
      } catch (error) {
         throw new CustomError("Error finding follow request: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
   }

   async acceptFriendRequest(requestId: string): Promise<void> {
      try {
         await Follower.findByIdAndUpdate(requestId, { status: "Accepted" });
      } catch (error) {
         throw new CustomError("Error accept follow requests: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
   }

   async rejectFriendRequest(requestId: string): Promise<void> {
      try {
         await Follower.findByIdAndUpdate(requestId, { status: "Rejected" });
      } catch (error) {
         throw new CustomError("Error reject follow requests: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
   }

   async handleFetchSuggestions(): Promise<IUser[]> {
      try {
         const suggestions = await UserModel.find()
           .sort({ createdAt: -1 })
           .limit(10)
           .select('id username displayName profileImage');
         return suggestions;
      } catch (error) {
         throw new CustomError("Error fetching suggestions: " + (error instanceof Error ? error.message : "Unknown error"), 500);
      }
    }
  

}