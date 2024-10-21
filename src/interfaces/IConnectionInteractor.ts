export interface IConnectionInteractor{
    followUser(followerId: string, userId: string): Promise<{ status: string, message: string }>
    unfollowUser(userId: string, followerId: string): Promise<void>
}