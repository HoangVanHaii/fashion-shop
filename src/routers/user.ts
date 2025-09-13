import { Router } from "express";
import * as userController from "../controllers/user";
import * as userValidator from "../middlewares/validateUser";
import { uploadUser } from "../utils/uploadUser";
import { validateRequest } from "../middlewares/validateRequest";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", userValidator.registerValidator, validateRequest, userController.registerUser);

router.post("/login", userValidator.loginValidator, validateRequest, userController.loginUser);

router.post("/verify-register", userValidator.verifyOtpValidator, validateRequest, userController.verifyRegisterUser);
router.post("/refresh-token", userValidator.refreshTokenValidator, validateRequest, userController.refreshToken);

router.get("/me", authMiddleware, userController.getProfile);
router.get("/:id",authMiddleware, userController.getUserById);
router.get("/",authMiddleware, userController.getAllUsers);

router.put("/change-phone", authMiddleware, userValidator.changePhoneValidator, validateRequest, userController.changePhone);
router.put("/update-avatar", authMiddleware, userValidator.avatarValidator, uploadUser, userController.updateAvatar);

router.put("/change-password", authMiddleware, userValidator.changePasswordValidator, validateRequest, userController.changePassword);

router.post("/forgot-password", userValidator.forgotPasswordValidator, validateRequest, userController.forgotPassword);
router.post("/verify-forgot-password", userValidator.verifyForgotPasswordValidator, validateRequest, userController.verifyForgotPasswordOtp);
router.put("/reset-password",userValidator.resetPasswordValidator, validateRequest, userController.resetPassword);

router.put("/change-email", authMiddleware, userValidator.changeEmailValidator, validateRequest, userController.changeEmail);
router.put("/verify-change-email", authMiddleware, userValidator.verifyChangeEmailValidator, validateRequest, userController.verifyChangeEmail);

router.put('/:id', authMiddleware, userValidator.updateUserValidator, validateRequest, userController.updateInfo);
router.delete('/:id', authMiddleware, userController.deleteUser);
router.put('/unlock/:id', authMiddleware, userController.unlockUser);

export default router;
