import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongoose";

interface JwtPayload {
    userId: string;
}

export interface IGetUserAuthInfoRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
       res.status(401).json({ message: "Authorization header is missing or malformed" });
       return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, "sdaf") as JwtPayload;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
