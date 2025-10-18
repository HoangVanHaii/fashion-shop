import { Request, Response, NextFunction } from "express";
import { SellerRequest, User } from "../interfaces/user";
import * as userService from "../services/user";
import * as utils from "../utils/sendOTP";
import * as otpService from "../services/otp";
import * as jwtUtils from "../utils/token"
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, phone, password, dateOfBirth } = req.body;
        const avatar = "/uploads/users/default-avatar.png";
        await userService.registerUser({ email, phone, name, date_of_birth: dateOfBirth, password, role: "customer", avatar, gender: "other" } as User);
        await sendOTP(email);
        res.status(200).json({
            success: true,
            message: "OTP has been sent to your email. Please verify it."
        });

    } catch (err) {
        next(err);
    }
}
export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await sendOTP(email);
        res.status(200).json({
            success: true,
            message: "OTP has been sent to your email. Please verify it."
        });
        
    } catch (err) {
        next(err);
    }
}
export const sendOTP = async (email: string) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const subject: string = "Mã OTP xác thực";
        const html: string = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`
        const issent = await utils.sendMail(email, subject, html);
        if (!issent) {
            throw new AppError("Failed to send OTP", 400);
        }
        await otpService.saveOtp(email, otp);
        return true;
    } catch (err) {
        if (err instanceof (AppError)) throw err;
        console.error(err);
        throw new AppError("Failed to sendOTP", 500, false)
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
        console.log(err);
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

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.user!.id;
        const { name, dateOfBirth, phone, gender } = req.body;
        const checkUser = await userService.getUserById(id);
        const date_of_birth = dateOfBirth;
        if (!checkUser) {
            throw new AppError("User not found", 404);
        }
        const user = { id, name, email: "", role: "customer", date_of_birth, phone, gender } as User;
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
export const createRequestSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.user!.id;
        const { name, phone, email, address, cccd, description } = req.body
        await userService.checkSellerRequestByUserId(user_id);
        await userService.createRequestSeller({ user_id, name, phone, email, address, cccd, description, status: "pending" })
        return res.status(200).json({
            success: true,
            message: "Your Seller Request has been submited successfully"
        })
    } catch (err) {
        next(err)
    }
}
export const getShopDetailById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop_id = parseInt(req.params.id)
        let ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress;

        if (ip?.startsWith("::ffff:")) {
            ip = ip.substring(7);
        }
        if (ip === "::1") {
            ip = "127.0.0.1";
        }
        const result = await userService.getShopDetailById(shop_id, ip!.toString());
        return res.status(200).json({
            success: true,
            message: "Shop details fetched successfully",
            data: result
        });
    } catch (err) {
        next(err);
    }
}

export const changeLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop_id = parseInt(req.params.id)
        const file = req.file;
        const logo = "/uploads/shops/" + file?.filename;
        await userService.changeLogo(shop_id, logo);
        return res.status(201).json({
            success: true,
            message: "Logo updated successfully",
            data: logo
        })
    } catch (err) {
        next(err);
    }
}
export const getShopTodoSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop_id = parseInt(req.params.id)
        const result = await userService.getShopTodoSummary(shop_id);
        return res.status(200).json({
            success: true,
            message: "Get ShopTodoSummary successfully",
            data: result
        })
    } catch (err) {
        next(err);
    }
}
export const getShopStatistic = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop_id = parseInt(req.params.id)
        const result = await userService.getShopStatistic(shop_id);
        return res.status(200).json({
            success: true,
            message: "Get ShopStatistic successfully",
            data: result
        })
    } catch (err) {
        next(err);
    }
}
export const getReviewRatingDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop_id = parseInt(req.params.id)
        const ratings = (req.query.ratings as string ||  "1,2,3,4,5" );
        const result = await userService.getReviewRatingDetail(shop_id, ratings);
        return res.status(200).json({
            success: true,
            message: "Get ReviewDetailRating successfully",
            data: result
        })
    } catch (err) {
        next(err);
    }
}

export const getShopReviewSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shop_id = parseInt(req.params.id)
        const result = await userService.getShopReviewSummary(shop_id);
        return res.status(200).json({
            success: true,
            message: "Get ReviewSummary successfully",
            data: result
        })
    } catch (err) {
        next(err);
    }
}