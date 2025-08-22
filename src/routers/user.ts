import { Router } from "express";
import * as userController from "../controllers/user"

const router = Router();

router.post('/register', userController.registerUser);
router.post('/verify-register', userController.verifyRegisterUser)

export default router;
