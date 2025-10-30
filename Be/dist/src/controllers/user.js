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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShopReviewSummary = exports.getReviewRatingDetail = exports.getShopStatistic = exports.getShopTodoSummary = exports.changeLogo = exports.getShopNameByProductId = exports.getShopDetailById = exports.createRequestSeller = exports.resetPassword = exports.verifyForgotPasswordOtp = exports.forgotPassword = exports.verifyChangeEmail = exports.changeEmail = exports.changePassword = exports.updateAvatar = exports.updateProfile = exports.getProfile = exports.getNameById = exports.refreshToken = exports.loginUser = exports.verifyRegisterUser = exports.sendOTP = exports.resendOtp = exports.registerUser = void 0;
const userService = __importStar(require("../services/user"));
const utils = __importStar(require("../utils/sendOTP"));
const otpService = __importStar(require("../services/otp"));
const jwtUtils = __importStar(require("../utils/token"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = require("../utils/appError");
const registerUser = async (req, res, next) => {
    try {
        const { name, email, phone, password, dateOfBirth } = req.body;
        const avatar = "/uploads/users/default-avatar.png";
        await userService.registerUser({ email, phone, name, date_of_birth: dateOfBirth, password, role: "customer", avatar, gender: "other" });
        await (0, exports.sendOTP)(email);
        res.status(200).json({
            success: true,
            message: "OTP has been sent to your email. Please verify it."
        });
    }
    catch (err) {
        next(err);
    }
};
exports.registerUser = registerUser;
const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        await (0, exports.sendOTP)(email);
        res.status(200).json({
            success: true,
            message: "OTP has been sent to your email. Please verify it."
        });
    }
    catch (err) {
        next(err);
    }
};
exports.resendOtp = resendOtp;
const sendOTP = async (email) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const subject = "Mã OTP xác thực";
        const html = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`;
        const issent = await utils.sendMail(email, subject, html);
        if (!issent) {
            throw new appError_1.AppError("Failed to send OTP", 400);
        }
        await otpService.saveOtp(email, otp);
        return true;
    }
    catch (err) {
        if (err instanceof (appError_1.AppError))
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to sendOTP", 500, false);
    }
};
exports.sendOTP = sendOTP;
const verifyRegisterUser = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const isValid = await otpService.verifyOtp(email, otp);
        if (!isValid) {
            throw new appError_1.AppError("Invalid or expired OTP", 400);
        }
        await userService.verifyRegisterUser(email);
        const subject = "Đăng ký tài khoản thành công";
        const html = "Chúc mừng bạn đã đăng ký thành công sàn thương mại điện tử!";
        await utils.sendMail(email, subject, html);
        res.status(200).json({
            success: true,
            message: "Account registration successful"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.verifyRegisterUser = verifyRegisterUser;
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await userService.loginUser(email, password);
        return res.status(200).json({
            success: true,
            message: "Login success",
            data: result
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
};
exports.loginUser = loginUser;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                throw new appError_1.AppError("Invalid or expired refresh token", 403);
            }
            const newAccessToken = jwtUtils.accessToken(user.id, user.email, user.role);
            return res.status(200).json({
                success: true,
                accessToken: newAccessToken
            });
        });
    }
    catch (err) {
        next(err);
    }
};
exports.refreshToken = refreshToken;
const getNameById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const name = await userService.getNameById(id);
        if (!name) {
            throw new appError_1.AppError("User not found", 404);
        }
        return res.status(200).json({
            success: true,
            message: "get userById successfully",
            data: name
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getNameById = getNameById;
const getProfile = async (req, res, next) => {
    try {
        const id = req.user.id;
        const user = await userService.getUserById(id);
        if (!user) {
            throw new appError_1.AppError("User not found", 404);
        }
        return res.status(200).json({
            success: true,
            message: "get user successfully",
            data: user
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const id = req.user.id;
        const { name, dateOfBirth, phone, gender } = req.body;
        const checkUser = await userService.getUserById(id);
        const date_of_birth = dateOfBirth;
        if (!checkUser) {
            throw new appError_1.AppError("User not found", 404);
        }
        const user = { id, name, email: "", role: "customer", date_of_birth, phone, gender };
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
exports.updateProfile = updateProfile;
const updateAvatar = async (req, res, next) => {
    try {
        const id = req.user.id;
        const file = req.file;
        const avatarPath = "/uploads/users/" + file.filename;
        await userService.updateAvatar(id, avatarPath);
        return res.status(200).json({
            success: true,
            message: "Avatar updated successfully",
            data: { avatar: avatarPath }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateAvatar = updateAvatar;
const changePassword = async (req, res, next) => {
    try {
        const { password, newPassword } = req.body;
        const id = req.user.id;
        await userService.changePassword(id, password, newPassword);
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.changePassword = changePassword;
const changeEmail = async (req, res, next) => {
    try {
        const { newEmail, password } = req.body;
        const id = req.user.id;
        await userService.changeEmail(id, newEmail, password);
        return res.status(200).json({
            success: true,
            message: "OTP has been sent to your Email. Please verify it.",
            data: { newEmail: newEmail }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.changeEmail = changeEmail;
const verifyChangeEmail = async (req, res, next) => {
    try {
        const id = req.user.id;
        const { newEmail, otp } = req.body;
        await userService.verifyChangeEmail(id, newEmail, otp);
        return res.status(200).json({
            success: true,
            message: "Your email has been changed successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.verifyChangeEmail = verifyChangeEmail;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        await userService.forgotPassword(email);
        return res.status(200).json({
            success: true,
            message: "OTP has been sent to your email. Please verify it.",
            data: { email: email }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.forgotPassword = forgotPassword;
const verifyForgotPasswordOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        await userService.verifyForgotPasswordOtp(email, otp);
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can now reset your password."
        });
    }
    catch (err) {
        next(err);
    }
};
exports.verifyForgotPasswordOtp = verifyForgotPasswordOtp;
const resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;
        await userService.resetPassword(email, newPassword);
        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    }
    catch (err) {
        next(err);
    }
};
exports.resetPassword = resetPassword;
const createRequestSeller = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { name, phone, email, address, cccd, description } = req.body;
        await userService.checkSellerRequestByUserId(user_id);
        await userService.createRequestSeller({ user_id, name, phone, email, address, cccd, description, status: "pending" });
        return res.status(200).json({
            success: true,
            message: "Your Seller Request has been submited successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createRequestSeller = createRequestSeller;
const getShopDetailById = async (req, res, next) => {
    try {
        const shop_id = parseInt(req.params.id);
        let ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
        if (ip?.startsWith("::ffff:")) {
            ip = ip.substring(7);
        }
        if (ip === "::1") {
            ip = "127.0.0.1";
        }
        const result = await userService.getShopDetailById(shop_id, ip.toString());
        return res.status(200).json({
            success: true,
            message: "Shop details fetched successfully",
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getShopDetailById = getShopDetailById;
const getShopNameByProductId = async (req, res, next) => {
    try {
        const product_id = parseInt((req.params.productId || req.params.id));
        const shopName = await userService.getShopnameByProduct_id(product_id);
        if (!shopName) {
            throw new appError_1.AppError("Shop not found for the given product", 404);
        }
        return res.status(200).json({
            success: true,
            message: "Shop name fetched successfully",
            data: { shopName }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getShopNameByProductId = getShopNameByProductId;
const changeLogo = async (req, res, next) => {
    try {
        const shop_id = parseInt(req.params.id);
        const file = req.file;
        const logo = "/uploads/shops/" + file?.filename;
        await userService.changeLogo(shop_id, logo);
        return res.status(201).json({
            success: true,
            message: "Logo updated successfully",
            data: logo
        });
    }
    catch (err) {
        next(err);
    }
};
exports.changeLogo = changeLogo;
const getShopTodoSummary = async (req, res, next) => {
    try {
        const shop_id = await userService.getShopIdByUserId(req.user?.id);
        const result = await userService.getShopTodoSummary(shop_id);
        return res.status(200).json({
            success: true,
            message: "Get ShopTodoSummary successfully",
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getShopTodoSummary = getShopTodoSummary;
const getShopStatistic = async (req, res, next) => {
    try {
        const shop_id = await userService.getShopIdByUserId(req.user?.id);
        const result = await userService.getShopStatistic(shop_id);
        return res.status(200).json({
            success: true,
            message: "Get ShopStatistic successfully",
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getShopStatistic = getShopStatistic;
const getReviewRatingDetail = async (req, res, next) => {
    try {
        const shop_id = parseInt(req.params.id);
        const ratings = (req.query.ratings || "1,2,3,4,5");
        const result = await userService.getReviewRatingDetail(shop_id, ratings);
        return res.status(200).json({
            success: true,
            message: "Get ReviewDetailRating successfully",
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getReviewRatingDetail = getReviewRatingDetail;
const getShopReviewSummary = async (req, res, next) => {
    try {
        const shop_id = parseInt(req.params.id);
        const result = await userService.getShopReviewSummary(shop_id);
        return res.status(200).json({
            success: true,
            message: "Get ReviewSummary successfully",
            data: result
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getShopReviewSummary = getShopReviewSummary;
