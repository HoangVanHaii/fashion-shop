import { Request, Response } from "express";
import { User } from "../interfaces/user";
import * as userService from "../services/user";
import * as utils from "../utils/sendOTP";
import * as otpService from "../services/otp";
import * as jwtUtils from "../utils/jwt"
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        await userService.registerUser({email, name, password, role} as User);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const issent = await utils.sendOtp(email, otp);
        
        if (!issent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP"
            });
        }
        await otpService.saveOtp(email, otp);
        res.status(200).json({
            success: true,
            message: "OTP has been sent to your email. Please verify it."
        });

    } catch (err: any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("RegisterUser controller error:", message);

        return res.status(status).json({
            success: false,
            message: message
        });
    }
}
export const verifyRegisterUser = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        const isValid = await otpService.verifyOtp(email, otp);
        
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }
        
        await userService.verifyRegisterUser(email);

        res.status(200).json({
            success: true,
            message: "Account registration successful"
        });

    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("verifyRegisterUser controller error:", message);
        
        res.status(500).json({
            success: false,
            message: message
        });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);

        return res.status(200).json({
            success: true,
            message: "Login success",
            data: result
        });
        
    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("loginUser controller: ", message);
        
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        jwt.verify(refreshToken, process.env.JWT_SECRET as string, (err: any, user: any) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid or expired refresh token"
                });
            }
            const newAccessToken = jwtUtils.accessToken(user.id, user.email, user.role);

            return res.status(200).json({
                success: true,
                accessToken: newAccessToken
            })
        } )

    } catch (err : any) {
        console.error("refreshToken controller error: ", err.message);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }
}

export const getProfile = async (req: Request, res: Response) => {
    try {
        const id = req.user?.id;

        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "get user successfully",
            user

        });

    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("getUserById controller error:", message);
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "get userById successfully",
            user

        });

    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("getUserById controller error:", message);
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const role = req.user?.role;
        if (role !== "admin") {
            return res.status(403).json({
                success: false, 
                message: "Admin only"
            })
        }
        const result = await userService.getAllUsers();
        return res.status(200).json({
            success: true,
            message: "Get all users successfully",
            data: result
        })

    } catch (err : any) {
        console.error("getUserById controller error:", err.message || "Internal server error");
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error"
        });
    }

}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { name, address, password } = req.body;
        const id = req.user?.id;
        await userService.updateProfile(id, name, address, password);
        
        return res.status(200).json({
            success: true,
            message: "User profile updated successfully"
        });

    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("updateUser controller error:", message);
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}
export const updateInfo = async (req: Request, res: Response) => {
    try {
        const roleAmin = req.user?.role;
        if (roleAmin !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin only"
            })
        }
        const { id, name, email, address, role, status, password } = req.body;
        const checkUser = await userService.getUserById(id);
        if (!checkUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        const user = { id, name, email, address, role, status, password } as User;
        await userService.updateInfo(user);

        return res.status(200).json({
            success: true,
            message: "User updated successfully"
        })
        
    } catch (err : any) {
        console.error("updateInfo controller error:", err.message || "Internal server error");
        return res.status(500).json({
            success: false,
            message: err.message || "Internal server error"
        })
    }
}
export const changePassword = async (req: Request, res: Response) => {
    try {
        const { password, newPassword } = req.body;
        const id = req.user?.id;

        await userService.changePassword(id, password, newPassword);
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
        
    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";

        console.error("changePassword controller error:", message);
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}
export const changeEmail = async (req: Request, res: Response) => {
    try {
        const { newEmail, password } = req.body;
        const id = req.user?.id;
        await userService.changeEmail(id, newEmail, password);
        return res.status(200).json({
            success: true,
            message: "OTP has been sent to your Email. Please verify it.",
            newEmail: newEmail
        });
    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";

        console.error("changeEmail controller error:", message);
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}
export const verifyChangeEmail = async (req: Request, res: Response) => {
    try {
        const id = req.user?.id;
        const { newEmail, otp } = req.body;
        await userService.verifyChangeEmail(id, newEmail, otp);
        return res.status(200).json({
            success: true,
            message: "Your email has been changed successfully"
        });

    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("verifyChangeEmail controller error:", message);
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        await userService.forgotPassword(email);

        return res.status(200).json({
            success: true,
            message: "OTP has been sent to your email. Please verify it.",
            data: email
        })

    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error(message);
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}
export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        await userService.verifyForgotPasswordOtp(email, otp);
        return res.status(200).json({
            success: true,
            message: email
        })
        
    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error(message);
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, newPassword } = req.body;
        await userService.resetPassword(email, newPassword);
        return res.status(200).json({
            success: true, 
            message: "Password reset successfully",
            data: email
        })
    } catch (err : any) {
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        console.error("resetPassword controller error: ", message);
        return res.status(status).json({
            success: false,
            message: message
        });
    }
}