import { User } from "../entities/User";
import { IFollower, IFollowerWithDetails } from "../Models/FollowModel";
import { IUser } from "../Models/UserModel";

export interface IConnectionRepository{
    findFollowRequest(followerId: string, userId: string): Promise<IFollower | null>
    followUser(followerId: string, userId: string, status: string): Promise<void>
    handleUnfollow(userId: string, followerId: string): Promise<void>
    searchUsers(query: string):Promise<{ id: string; username: string; displayName: string; profileImage: string }[]>
    findUserByUsername(username: string): Promise<User | null>
    getFollowStatus(ownUserId: string, userId: string): Promise<string>
    fetchFollowers(userId: string): Promise<IFollower[]>
    fetchFollowing(userId: string): Promise<IFollower[]>
    getFollowRequests(userId: string): Promise<IFollowerWithDetails[]>
    acceptFriendRequest(requestId: string): Promise<void>
    rejectFriendRequest(requestId: string): Promise<void>
    getFollowRequestById(requestId: string): Promise<{ userId: string, followerId: string } | null>
    handleFetchSuggestions(): Promise<IUser[]>
}
