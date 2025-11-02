import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { User } from "../interfaces/user";
import { AppError } from "../utils/appError";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);       
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Token is required", 401);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as User;
        (req as any).user = decoded;
        next();
    } catch (err: any) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new AppError("Token expired", 401);
        }
        else {
            throw new AppError("Invalid token", 401);
        }   
    }
}
export const isAdmin = (req: Request, res: Response, next: NextFunction) =>{
    const role = req.user?.role;
    if(role !== "admin"){
        throw new AppError('Forbidden: Admins only ', 403)
    }
    next();
}
export const isSeller = (req: Request, res: Response, next: NextFunction) =>{
const role = req.user?.role;
    if(role !== "seller"){
        throw new AppError('Forbidden: Sellers only ', 403)
    }
    next();
}
export const adminOrSeller = (req: Request, res: Response, next: NextFunction) =>{
    const role = req.user?.role;
    if(role !== "admin" && role !== "seller"){
        throw new AppError('Forbidden: Admins or Sellers only ', 403)
    }
    next();
}

