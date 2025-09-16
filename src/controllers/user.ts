import { Request, Response, NextFunction } from "express";
import { User } from "../interfaces/user";
import * as userService from "../services/user";
import * as utils from "../utils/sendOTP";
import * as otpService from "../services/otp";
import * as jwtUtils from "../utils/jwt"
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, password, dateOfBirth } = req.body;
        const avatar = "/uploads/default-avatar.png";
        await userService.registerUser({ email, phone, name, date_of_birth: dateOfBirth, password, role: "customer", avatar } as User);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const subject: string = "Mã OTP xác thực";
        const html: string = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`
        const issent = await utils.sendMail(email, subject, html);
        
        if (!issent) {
            throw new AppError("Failed to send OTP", 400);
        }
        await otpService.saveOtp(email, otp);
        res.status(200).json({
            success: true,
            message: "OTP has been sent to your email. Please verify it."
        });

    } catch (err) {
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
        const subject: string = "Đăng ký tài khoản thành công"
        const html: string = "Chúc mừng bạn đã đăng ký thành công sàn thương mại điện tử!"
        await utils.sendMail(email, subject, html);
        
        res.status(200).json({
            success: true,
            message: "Account registration successful"
        });

    } catch (err) {
        next(err);
    }
}

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const keyword = req.query.keyword as string || "";
        const result = await userService.searchUser(keyword);
        return res.status(200).json({
            success: true,
            message: "Search users successfully",
            data: result
        });
    } catch (err) {
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
        
    } catch (err) {
        next(err);
    }
}
export const createUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, role, dateOfBirth } = req.body;
        const avatar = "/uploads/default-avatar.png";
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        let password = "";
        for (let i = 0; i < 8; i++){
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        await userService.createUser({ email, phone, name, date_of_birth: dateOfBirth, password, role, avatar, is_verified: true } as User);
        const subject: string = "Thông tin tài khoản đăng nhập";
        const html: string = `Tài khoản của bạn đã được tạo thành công.
            Email: ${email}
            Mật khẩu: ${password}
            Vui lòng đổi mật khẩu sau khi đăng nhập.
            Trân trọng.`

        await utils.sendMail(email, subject, html);
        return res.status(200).json({
            success: true,
            message: "Create user successfully",
        });
    } catch (err) {
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

    } catch (err) {
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
            data: user

        });

    } catch (err) {
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
            data: user
        });

    } catch (err) {
        next(err);
    }
}
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = req.user?.role;
        const result = await userService.getAllUsers();
        return res.status(200).json({
            success: true,
            message: "Get all users successfully",
            data: result
        })

    } catch (err) {
        next(err);
    }

}
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.user!.id;
        const { name, dateOfBirth } = req.body;
        const checkUser = await userService.getUserById(id);
        const date_of_birth = dateOfBirth;
        if (!checkUser) {
            throw new AppError("User not found", 404);
        }
        const user = { id, name, email: "", role: "customer", date_of_birth } as User;
        await userService.updateInfo(user);

        return res.status(200).json({
            success: true,
            message: "User updated successfully"
        })
        
    } catch (err) {
        next(err);
    }
}
export const updateUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const { name, role, status, dateOfBirth, isVerified } = req.body;
        const checkUser = await userService.getUserById(id);
        const date_of_birth = dateOfBirth;
        if (!checkUser) {
            throw new AppError("User not found", 404);
        }
        const user = { id, name, email: "", role, phone:"", status, date_of_birth, is_verified: isVerified } as User;
        await userService.updateInfo(user);

        return res.status(200).json({
            success: true,
            message: "User updated successfully"
        })
        
    } catch (err) {
        next(err);
    }
}
export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.user!.id;
        const file = req.file;
        const avatarPath = "/uploads/users/" + file!.filename;
        
        await userService.updateAvatar(id, avatarPath);
        return res.status(200).json({
            success: true,
            message: "Avatar updated successfully",
            data: { avatar: avatarPath }
        })
    } catch (err) {
        next(err);
    }
}

export const changePhone = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { newPhone, password } = req.body;
        const id = req.user!.id;
        await userService.changePhone(id, newPhone, password);
        return res.status(200).json({
            success: true,
            message: "Phone number changed successfully",
            data: { newPhone: newPhone }
        });
        
    } catch (err) {
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
        
    } catch (err) {
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
            data: {newEmail: newEmail}
        });
    } catch (err) {
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

    } catch (err) {
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
            data: {email: email}
        })

    } catch (err) {
        next(err);
    }
}
export const verifyForgotPasswordOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;
        await userService.verifyForgotPasswordOtp(email, otp);
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can now reset your password."
        })
        
    } catch (err) {
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
        })
    } catch (err) {
        next(err);
    }
}
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const role = req.user?.role;
        const checkUser = await userService.getUserById(id);
        if (!checkUser) {
            throw new AppError("User not found", 404);
        }
        await userService.deleteUser(id);
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        })
        
    } catch (err) {
        next(err);
    }
}
export const unlockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const role = req.user?.role;
        const checkUser = await userService.getUserById(id);
        if (!checkUser) {
            throw new AppError("User not found", 404);
        }
        await userService.unlockUser(id);
        return res.status(200).json({
            success: true,
            message: "User unlocked successfully"
        })
        
    } catch (err) {
        next(err);
    }
}
