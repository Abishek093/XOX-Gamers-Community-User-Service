import { NextFunction, Request, response, Response } from "express";
import { ConnectionInteractor } from "../interactors/ConnectionInteractor";
import CustomError from "../utils/CustomError";

export class ConnectionController {
  constructor(private interarctor: ConnectionInteractor) { }


  followUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { followerId, userId } = req.params;
    try {
      const result = await this.interarctor.followUser(followerId, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error)
    }
  };

  unfollowUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { followerId, userId } = req.params;
    try {
      await this.interarctor.unfollowUser(userId, followerId);
      res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
      next(error)
    }
  };

  fetchSearchResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const query = req.query.query as string;
    console.log(query)
    if (!query) {
      throw new CustomError("Query parameter is required", 400)
    }
    try {
      const results = await this.interarctor.searchUsers(query);
      res.status(200).json({results})
    } catch (error) {
      next(error)
    }
  };

  fetchUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params;
    try {
      const user = await this.interarctor.getUserProfile(username);
      res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  };

  getFollowStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { ownUserId, userId } = req.params;
    try {
      const status = await this.interarctor.getFollowStatus(ownUserId, userId);
      res.status(200).json({ status });
    } catch (error) {
      next(error)
    }
  };

  fetchFollowers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const followers = await this.interarctor.fetchFollowers(userId);
      res.status(200).json(followers );
    } catch (error) {
      next(error)
    }
  };

  fetchFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const following = await this.interarctor.fetchFollowing(userId);
      res.status(200).json(following );
    } catch (error) {
      next(error)
    }
  };

  
  getFollowRequest = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  try {
    const requests = await this.interarctor.getFollowRequests(userId);
    res.status(200).json(requests)
  }catch (error) {
    next(error)
  }
};

  acceptFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params;
      await this.interarctor.acceptFollowRequest(requestId)
      res.status(200).json({ message: "Friend request accepted" })
    } catch (error) {
      next(error)
    }
  }

  rejectFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params;
      const response = await this.interarctor.rejectFollowRequest(requestId)
      res.status(200).json(response)
    } catch (error) {
      next(error)
    }
  }
}