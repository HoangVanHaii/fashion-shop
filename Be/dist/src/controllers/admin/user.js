"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondSellerRequest = exports.unlockUser = exports.deleteUser = exports.updateUserByAdmin = exports.getAllUsers = exports.getUserById = exports.searchUsers = exports.createUserByAdmin = void 0;
const userService = __importStar(require("../../services/user"));
const utils = __importStar(require("../../utils/sendOTP"));
const appError_1 = require("../../utils/appError");
const createUserByAdmin = async (req, res, next) => {
    try {
        const { name, email, phone, role, dateOfBirth } = req.body;
        const avatar = "/uploads/users/default-avatar.png";
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let password = "";
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        await userService.createUser({ email, phone, name, date_of_birth: dateOfBirth, password, role, avatar, is_verified: true, gender: "other" });
        const subject = "Thông tin tài khoản đăng nhập";
        const html = `Tài khoản của bạn đã được tạo thành công.
            Email: ${email}
            Mật khẩu: ${password}
            Vui lòng đổi mật khẩu sau khi đăng nhập.
            Trân trọng.`;
        await utils.sendMail(email, subject, html);
        return res.status(200).json({
            success: true,
            message: "Create user successfully",
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createUserByAdmin = createUserByAdmin;
const searchUsers = async (req, res, next) => {
    try {
        const keyword = req.query.keyword || "";
        const result = await userService.searchUser(keyword);
        return res.status(200).json({
            success: true,
            message: "Search users successfully",
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.searchUsers = searchUsers;
const getUserById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const user = await userService.getUserById(id);
        if (!user) {
            throw new appError_1.AppError("User not found", 404);
        }
        return res.status(200).json({
            success: true,
            message: "get userById successfully",
            data: user
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserById = getUserById;
const getAllUsers = async (req, res, next) => {
    try {
        const { status, role, isVerified } = req.query;
        const result = await userService.getAllUsers(role, status, isVerified);
        return res.status(200).json({
            success: true,
            message: "Get all users successfully",
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllUsers = getAllUsers;
const updateUserByAdmin = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { name, role, status, dateOfBirth, isVerified } = req.body;
        const checkUser = await userService.getUserById(id);
        const date_of_birth = dateOfBirth;
        if (!checkUser) {
            throw new appError_1.AppError("User not found", 404);
        }
        const user = { id, name, email: "", role, phone: "", status, date_of_birth, is_verified: isVerified };
        await userService.updateInfo(user);
        return res.status(200).json({
            success: true,
            message: "User updated successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateUserByAdmin = updateUserByAdmin;
const deleteUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const role = req.user?.role;
        const checkUser = await userService.getUserById(id);
        if (!checkUser) {
            throw new appError_1.AppError("User not found", 404);
        }
        await userService.deleteUser(id);
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUser = deleteUser;
const unlockUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const role = req.user?.role;
        const checkUser = await userService.getUserById(id);
        if (!checkUser) {
            throw new appError_1.AppError("User not found", 404);
        }
        await userService.unlockUser(id);
        return res.status(200).json({
            success: true,
            message: "User unlocked successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.unlockUser = unlockUser;
//////////////////////////////////////////////
const respondSellerRequest = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        await userService.respondSellerRequest(id, status);
        const message = status === "approved"
            ? "You have been successfully upgraded to a seller!" : "Your request to become a seller has been rejected.";
        return res.status(200).json({
            success: true,
            message: message
        });
    }
    catch (err) {
        next(err);
    }
};
exports.respondSellerRequest = respondSellerRequest;
