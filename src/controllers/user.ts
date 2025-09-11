import e, { Request, Response, NextFunction } from "express";
import { User } from "../interfaces/user";
import * as userService from "../services/user";
import * as utils from "../utils/sendOTP";
import * as otpService from "../services/otp";
import * as jwtUtils from "../utils/jwt"
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role } = req.body;

        await userService.registerUser({email, name, password, role} as User);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const issent = await utils.sendOtp(email, otp);
        
        if (!issent) {
            throw new AppError("Failed to send OTP", 400);
        }
        await otpService.saveOtp(email, otp);
        res.status(200).json({
            success: true,
            message: "OTP has been sent to your email. Please verify it."
        });

    } catch (err: any) {
        next(err);
    }
}
export const verifyRegisterUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        const isValid = await otpService.verifyOtp(email, otp);
        
        if (!isValid) {
            throw new AppError("Invalid or expired OTP", 400);
        }
        
        await userService.verifyRegisterUser(email);

        res.status(200).json({
            success: true,
            message: "Account registration successful"
        });

    } catch (err : any) {
        next(err);
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);

        return res.status(200).json({
            success: true,
            message: "Login success",
            data: result
        });
        
    } catch (err : any) {
        next(err);
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        jwt.verify(refreshToken, process.env.JWT_SECRET as string, (err: any, user: any) => {
            if (err) {
                throw new AppError("Invalid or expired refresh token", 403);
            }
            const newAccessToken = jwtUtils.accessToken(user.id, user.email, user.role);

            return res.status(200).json({
                success: true,
                accessToken: newAccessToken
            })
        } )

    } catch (err : any) {
        next(err);
    }
}

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.user!.id;

        const user = await userService.getUserById(id);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return res.status(200).json({
            success: true,
            message: "get user successfully",
            user

        });

    } catch (err : any) {
        next(err);
    }
}

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);

        const user = await userService.getUserById(id);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return res.status(200).json({
            success: true,
            message: "get userById successfully",
            user
        });

    } catch (err : any) {
        next(err);
    }
}
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = req.user?.role;
        if (role !== "admin") {
            throw new AppError("Admin only", 403);
        }
        const result = await userService.getAllUsers();
        return res.status(200).json({
            success: true,
            message: "Get all users successfully",
            data: result
        })

    } catch (err : any) {
        next(err);
    }

}

// export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { name, address, password, email } = req.body;
//         const id = req.user!.id;

//         const user = { name, address, password, email } as User;
//         await userService.updateInfo(user);
        
//         return res.status(200).json({
//             success: true,
//             message: "User profile updated successfully"
//         });

//     } catch (err : any) {
//         next(err);
//     }
// }
export const updateInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, name, email, address, role, status, password } = req.body;
        const checkUser = await userService.getUserById(id);
        if (!checkUser) {
            throw new AppError("User not found", 404);
        }
        const user = { id, name, email, address, role, status, password } as User;
        await userService.updateInfo(user);

        return res.status(200).json({
            success: true,
            message: "User updated successfully"
        })
        
    } catch (err : any) {
        next(err);
    }
}
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { password, newPassword } = req.body;
        const id = req.user!.id;

        await userService.changePassword(id, password, newPassword);
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
        
    } catch (err : any) {
        next(err);
    }
}
export const changeEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newEmail, password } = req.body;
        const id = req.user!.id;
        await userService.changeEmail(id, newEmail, password);
        return res.status(200).json({
            success: true,
            message: "OTP has been sent to your Email. Please verify it.",
            newEmail: newEmail
        });
    } catch (err : any) {
        next(err);
    }
}
export const verifyChangeEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.user!.id;
        const { newEmail, otp } = req.body;
        await userService.verifyChangeEmail(id, newEmail, otp);
        return res.status(200).json({
            success: true,
            message: "Your email has been changed successfully"
        });

    } catch (err : any) {
        next(err);
    }
}
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await userService.forgotPassword(email);

        return res.status(200).json({
            success: true,
            message: "OTP has been sent to your email. Please verify it.",
            data: email
        })

    } catch (err : any) {
        next(err);
    }
}
export const verifyForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        await userService.verifyForgotPasswordOtp(email, otp);
        return res.status(200).json({
            success: true,
            message: email
        })
        
    } catch (err : any) {
        next(err);
    }
}
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;
        await userService.resetPassword(email, newPassword);
        return res.status(200).json({
            success: true, 
            message: "Password reset successfully",
            data: email
        })
    } catch (err : any) {
        next(err);
    }
}