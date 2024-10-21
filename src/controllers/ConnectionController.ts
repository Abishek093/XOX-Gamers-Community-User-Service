import { NextFunction, Request, Response } from "express";
import { ConnectionInteractor } from "../interactors/ConnectionInteractor";

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
}