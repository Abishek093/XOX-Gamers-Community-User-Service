import { IFollower } from "../Models/FollowModel";

export interface IConnectionRepository{
    findFollowRequest(followerId: string, userId: string): Promise<IFollower | null>
    followUser(followerId: string, userId: string, status: string): Promise<void>
    handleUnfollow(userId: string, followerId: string): Promise<void>
}
