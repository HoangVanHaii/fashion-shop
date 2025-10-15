import { Router } from "express";
import * as userController from "../controllers/user";
import * as userValidator from "../middlewares/validateUser";
import { uploadUser, uploadLogo } from "../utils/uploadUser";
import { validateRequest } from "../middlewares/validateRequest";
import { authMiddleware, isSeller } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", userValidator.registerValidator, validateRequest, userController.registerUser);
router.post("/login", userValidator.loginValidator, validateRequest, userController.loginUser);
router.post("/resendOtp", userValidator.resendOtpValidator, validateRequest, userController.resendOtp);

router.post("/forgotPassword", userValidator.forgotPasswordValidator, validateRequest, userController.forgotPassword);
router.post("/verifyForgotPassword", userValidator.verifyForgotPasswordValidator, validateRequest, userController.verifyForgotPasswordOtp);
router.put("/resetPassword", userValidator.resetPasswordValidator, validateRequest, userController.resetPassword);

router.post("/verifyRegister", userValidator.verifyOtpValidator, validateRequest, userController.verifyRegisterUser);
router.post("/refreshToken", userValidator.refreshTokenValidator, validateRequest, userController.refreshToken);

router.get("/me", authMiddleware, userController.getProfile);

router.put('/updateProfile', authMiddleware, userValidator.updateUserValidator, validateRequest, userController.updateProfile);

router.put("/updateAvatar", authMiddleware, uploadUser, userValidator.avatarValidator, validateRequest, userController.updateAvatar);

router.put("/changePassword", authMiddleware, userValidator.changePasswordValidator, validateRequest, userController.changePassword);

router.put("/changeEmail", authMiddleware, userValidator.changeEmailValidator, validateRequest, userController.changeEmail);
router.put("/verifyChangeEmail", authMiddleware, userValidator.verifyChangeEmailValidator, validateRequest, userController.verifyChangeEmail);

//
router.put('/shop/:id', authMiddleware, isSeller, uploadLogo, userValidator.changeLogoValidator, validateRequest, userController.changeLogo)
router.get('/shop/:id', authMiddleware, userValidator.paramsShopId, validateRequest, userController.getShopDetailById);
router.post('/requestSeller', authMiddleware, userValidator.createSellerRequestValidator, validateRequest, userController.createRequestSeller);
router.get('/shop/statistic/:id', authMiddleware, isSeller, userValidator.paramsShopId, validateRequest, userController.getShopStatistic);
router.get('/shop/todoSummary/:id', authMiddleware, isSeller, userValidator.paramsShopId, validateRequest, userController.getShopTodoSummary);
router.get('/shop/reviewRatingDetail/:id', authMiddleware, isSeller, userValidator.paramsShopId, validateRequest, userController.getReviewRatingDetail)
router.get('/shop/reviewSummary/:id', authMiddleware, isSeller, userValidator.paramsShopId, validateRequest, userController.getShopReviewSummary)

export default router;
