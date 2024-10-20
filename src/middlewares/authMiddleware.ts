// import { Request, Response, NextFunction } from 'express';
// import { verifyToken } from '../../utils/jwt';

// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//     const authHeader = req.headers.authorization;
//     console.log("authHeader",authHeader);

//     // if (!authHeader) {
//     //     return res.status(401).json({ message: 'Authorization header missing' });
//     // }

//     // const token = authHeader.split(' ')[1];

//     // try {
//     //     const payload = verifyToken(token);
//     //     req.user = payload;
//     //     next();
//     // } catch (error) {
//     //     return res.status(401).json({ message: 'Invalid or expired token' });
//     // }
// };

import { NextFunction, Response, Request } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
// import UserModel, { IUser } from "../data/UserModel";
import { UserModel, IUser } from "../Models/UserModel";
import CustomError from "../utils/CustomError";
export const protectUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header("Authorization");
  console.log('req.headers',req.headers)
  if (!token || !token.startsWith("Bearer ")) {
    console.log("No token or invalid format");
    // throw new CustomError("Not authorized, no token or invalid format", 401)
    res.status(401).json({ message: "Not authorized, no token or invalid format" });
    return;
  }

  try {
    const tokenWithoutBearer = token.replace("Bearer ", "").trim();
    console.log("Token without Bearer:", tokenWithoutBearer);

    const secretKey: string = process.env.JWT_SECRET_KEY || "";
    const decoded = jwt.verify(tokenWithoutBearer, secretKey) as JwtPayload & { userId: string };
    console.log({ decoded });

    if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
      const userId = decoded.userId;
      const user: IUser | null = await UserModel.findById(userId);
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      if (user.isBlocked) {
        res.status(401).json({ message: "User is blocked" });
        return;
      }
      (req as any).locals = { user };
      next();
    } else {
      throw new Error('Invalid token format');
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};
