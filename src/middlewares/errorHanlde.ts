import { Request, Response, NextFunction} from "express";
import { AppError } from "../utils/appError";
export const handleError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof AppError && err.isOperational){
        return res.status(err.statusCode).json({
            status: "error",
            message: err.message
        });
    }
    console.error("Unexpected Error: ", err);
    return res.status(500).json({
        status: "error",
        message: "Internal Server Error"
    });
}