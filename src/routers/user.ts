import { Router } from "express";
import * as userController from "../controllers/user";
import * as userValidator from "../middlewares/validateUser";
import { uploadUser } from "../utils/uploadUser";
import { validateRequest } from "../middlewares/validateRequest";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", userValidator.registerValidator, validateRequest, userController.registerUser);
router.post("/createUser", authMiddleware, isAdmin, userValidator.createUserByAdminValidator, validateRequest, userController.createUserByAdmin);

router.post("/login", userValidator.loginValidator, validateRequest, userController.loginUser);

router.post("/verifyRegister", userValidator.verifyOtpValidator, validateRequest, userController.verifyRegisterUser);
router.post("/refreshToken", userValidator.refreshTokenValidator, validateRequest, userController.refreshToken);

router.get("/me", authMiddleware, userController.getProfile);
router.get("/", authMiddleware, isAdmin, userController.getAllUsers);
router.get("/search", authMiddleware, isAdmin, userController.searchUsers);
router.get("/:id",authMiddleware, isAdmin, userValidator.idValidator, validateRequest, userController.getUserById);

router.put('/updateProfile', authMiddleware, userValidator.updateUserValidator, validateRequest, userController.updateProfile);
router.put("/changePhone", authMiddleware, userValidator.changePhoneValidator, validateRequest, userController.changePhone);
router.put("/updateAvatar", authMiddleware, userValidator.avatarValidator, uploadUser, validateRequest, userController.updateAvatar);

router.put("/changePassword", authMiddleware, userValidator.changePasswordValidator, validateRequest, userController.changePassword);

router.post("/forgotPassword", userValidator.forgotPasswordValidator, validateRequest, userController.forgotPassword);
router.post("/verifyForgotPassword", userValidator.verifyForgotPasswordValidator, validateRequest, userController.verifyForgotPasswordOtp);
router.put("/resetPassword",userValidator.resetPasswordValidator, validateRequest, userController.resetPassword);

router.put("/changeEmail", authMiddleware, userValidator.changeEmailValidator, validateRequest, userController.changeEmail);
router.put("/verifyChangeEmail", authMiddleware, userValidator.verifyChangeEmailValidator, validateRequest, userController.verifyChangeEmail);

router.put('/unlock/:id', authMiddleware, isAdmin, userValidator.idValidator, validateRequest, userController.unlockUser);
router.put('/:id', authMiddleware, isAdmin, userValidator.updateUserByAdminValidator, validateRequest, validateRequest, userController.updateUserByAdmin)
router.delete('/:id', userValidator.idValidator, validateRequest, authMiddleware, isAdmin, userController.deleteUser);

export default router;
