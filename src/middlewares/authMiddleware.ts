import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User } from "../interfaces/user";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as User;
        (req as any).user = decoded;
        next();
    } catch (err : any) {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Token expired" });
        }
        else {
            return res.status(401).json({ message: "Invalid token" });
        }
    }
}