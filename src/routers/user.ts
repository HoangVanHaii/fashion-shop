import { Router } from "express";
import * as userController from "../controllers/user";
import * as userValidator from "../middlewares/validateUser";
import { validateRequest } from "../middlewares/validateRequest";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post(
  "/register",
  userValidator.registerValidator,
  validateRequest,
  userController.registerUser
);
router.post("/verify-register", userValidator.verifyOtpValidator, validateRequest, userController.verifyRegisterUser);

router.post("/login", userValidator.loginValidator, validateRequest, userController.loginUser);

router.post("/refresh-token", userValidator.refreshTokenValidator, validateRequest, userController.refreshToken);

router.get("/me", authMiddleware, userController.getProfile);
router.get("/:id",authMiddleware, userController.getUserById);
router.get("/",authMiddleware, userController.getAllUsers);

router.post("/update-profile", authMiddleware, userValidator.updateUserValidator, validateRequest, userController.updateUser);


router.post("/change-password", authMiddleware, userValidator.changePasswordValidator, validateRequest, userController.changePassword);
router.post('/:id', authMiddleware, userController.updateInfo);

router.post("/forgot-password", userValidator.forgotPasswordValidator, validateRequest, userController.forgotPassword);
router.post("/verify-forgot-password", userValidator.verifyForgotPasswordValidator, validateRequest, userController.verifyForgotPasswordOtp);
router.post("/reset-password",userValidator.resetPasswordValidator, validateRequest, userController.resetPassword);

router.post("/change-email", authMiddleware, userValidator.changeEmailValidator, validateRequest, userController.changeEmail);
router.post("/verify-change-email", authMiddleware, userValidator.verifyChangeEmailValidator, validateRequest, userController.verifyChangeEmail);

export default router;
