import { Request, Response, NextFunction } from "express";
import { User } from "../../interfaces/user";
import * as userService from "../../services/user";
import * as utils from "../../utils/sendOTP";
import { AppError } from "../../utils/appError";

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
        const { status, role, isVerified } = req.query;
        const result = await userService.getAllUsers( role as string, status as string, isVerified as string);
        return res.status(200).json({
            success: true,
            message: "Get all users successfully",
            data: result
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
