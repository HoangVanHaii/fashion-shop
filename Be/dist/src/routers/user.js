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
const express_1 = require("express");
const userController = __importStar(require("../controllers/user"));
const userValidator = __importStar(require("../middlewares/validateUser"));
const uploadUser_1 = require("../utils/uploadUser");
const validateRequest_1 = require("../middlewares/validateRequest");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/register", userValidator.registerValidator, validateRequest_1.validateRequest, userController.registerUser);
router.post("/login", userValidator.loginValidator, validateRequest_1.validateRequest, userController.loginUser);
router.post("/resendOtp", userValidator.resendOtpValidator, validateRequest_1.validateRequest, userController.resendOtp);
router.post("/forgotPassword", userValidator.forgotPasswordValidator, validateRequest_1.validateRequest, userController.forgotPassword);
router.post("/verifyForgotPassword", userValidator.verifyForgotPasswordValidator, validateRequest_1.validateRequest, userController.verifyForgotPasswordOtp);
router.put("/resetPassword", userValidator.resetPasswordValidator, validateRequest_1.validateRequest, userController.resetPassword);
router.post("/verifyRegister", userValidator.verifyOtpValidator, validateRequest_1.validateRequest, userController.verifyRegisterUser);
router.post("/refreshToken", userValidator.refreshTokenValidator, validateRequest_1.validateRequest, userController.refreshToken);
router.get("/me", authMiddleware_1.authMiddleware, userController.getProfile);
router.put('/updateProfile', authMiddleware_1.authMiddleware, userValidator.updateUserValidator, validateRequest_1.validateRequest, userController.updateProfile);
router.put("/updateAvatar", authMiddleware_1.authMiddleware, uploadUser_1.uploadUser, userValidator.avatarValidator, validateRequest_1.validateRequest, userController.updateAvatar);
router.put("/changePassword", authMiddleware_1.authMiddleware, userValidator.changePasswordValidator, validateRequest_1.validateRequest, userController.changePassword);
router.put("/changeEmail", authMiddleware_1.authMiddleware, userValidator.changeEmailValidator, validateRequest_1.validateRequest, userController.changeEmail);
router.put("/verifyChangeEmail", authMiddleware_1.authMiddleware, userValidator.verifyChangeEmailValidator, validateRequest_1.validateRequest, userController.verifyChangeEmail);
router.get("/getName/:id", userController.getNameById);
//
router.get('/shop/statistic', authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, userController.getShopStatistic);
router.get('/shop/todoSummary', authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, userController.getShopTodoSummary);
router.put('/shop/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, uploadUser_1.uploadLogo, userValidator.changeLogoValidator, validateRequest_1.validateRequest, userController.changeLogo);
router.get('/shop/:id', userValidator.paramsShopId, validateRequest_1.validateRequest, userController.getShopDetailById);
router.post('/requestSeller', authMiddleware_1.authMiddleware, userValidator.createSellerRequestValidator, validateRequest_1.validateRequest, userController.createRequestSeller);
router.get('/shop/reviewRatingDetail/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, userValidator.paramsShopId, validateRequest_1.validateRequest, userController.getReviewRatingDetail);
router.get('/shop/reviewSummary/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, userValidator.paramsShopId, validateRequest_1.validateRequest, userController.getShopReviewSummary);
router.get('/shop/nameByProduct/:id', userController.getShopNameByProductId);
exports.default = router;
