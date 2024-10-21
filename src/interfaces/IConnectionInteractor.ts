import { UserDetails } from "../entities/Types";
import { IFollower, IFollowerWithDetails } from "../Models/FollowModel";

export interface IConnectionInteractor{
    followUser(followerId: string, userId: string): Promise<{ status: string, message: string }>
    unfollowUser(userId: string, followerId: string): Promise<void>
    searchUsers(query: string):Promise<{ id: string; username: string; displayName: string; profileImage: string }[]>
    getUserProfile(username: string): Promise<UserDetails | null>
    getFollowStatus (ownUserId: string, userId: string):Promise<string>
    fetchFollowers(userId: string): Promise<IFollower[]>
    fetchFollowing(userId: string): Promise<IFollower[]>
    getFollowRequests(userId: string):Promise<IFollowerWithDetails[]>
    acceptFollowRequest(requestId: string): Promise<void>
    rejectFollowRequest(requestId: string): Promise<void>
}