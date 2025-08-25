import { Router } from "express";
import * as userController from "../controllers/user"
import * as userValidator from "../middlewares/validateUser"
import * as otpValidator from "../middlewares/validateOtp"
import { validateRequest } from "../middlewares/validateRequest";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post('/register', userValidator.registerValidator, validateRequest, userController.registerUser);
router.post('/verify-register', otpValidator.verifyOtpValidator, validateRequest, userController.verifyRegisterUser); 

router.post('/login', userValidator.loginValidator, validateRequest, userController.loginUser);

router.post('/refresh-token', userValidator.refreshTokenValidator, validateRequest, userController.refreshToken);

router.get('/me', authMiddleware, userController.getUserById);


export default router;
