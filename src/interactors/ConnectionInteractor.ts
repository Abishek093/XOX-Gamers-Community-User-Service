import { UserDetails } from "../entities/Types";
import { IConnectionInteractor } from "../interfaces/IConnectionInteractor";
import { Follower, IFollower, IFollowerWithDetails } from "../Models/FollowModel";
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

  async searchUsers(query: string): Promise<{ id: string; username: string; displayName: string; profileImage: string }[]> {
    try {
      return this.repository.searchUsers(query)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async getUserProfile(username: string): Promise<UserDetails | null> {
    try {
      const user = await this.repository.findUserByUsername(username);
      if (user) {
        return {
          id: user.id,
          username: user.userName,
          displayName: user.displayName,
          profileImage: user.profileImage,
          titleImage: user.titleImage,
          bio: user.bio,
        };
      }
      return null;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }


  async getFollowStatus(ownUserId: string, userId: string): Promise<string> {
    try {
      return await this.repository.getFollowStatus(ownUserId, userId)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async fetchFollowers(userId: string): Promise<IFollower[]> {
    try {
      return await this.repository.fetchFollowers(userId)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async fetchFollowing(userId: string): Promise<IFollower[]> {
    try {
      return await this.repository.fetchFollowing(userId)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async getFollowRequests(userId: string): Promise<IFollowerWithDetails[]> {
    try {
      return await this.repository.getFollowRequests(userId)
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async acceptFollowRequest(requestId: string): Promise<void>{
    try {
      const followRequest = await this.repository.getFollowRequestById(requestId);
      if (followRequest) {
        const { userId, followerId } = followRequest;
        await this.repository.acceptFriendRequest(requestId)
      }else{
        throw new CustomError("Follow request not found",404)
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      } else {
        console.error(error);
        throw new CustomError("Internal Server Error", 500);
      }
    }
  }

  async rejectFollowRequest(requestId: string): Promise<void>{
    try {
      const followRequest = await this.repository.getFollowRequestById(requestId);
      if (followRequest) {
        const { userId, followerId } = followRequest;
        await this.repository.rejectFriendRequest(requestId)
      }else{
        throw new CustomError("Follow request not found",404)
      }
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