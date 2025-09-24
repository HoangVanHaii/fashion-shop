// routes/userVoucher.routes.ts
import { Router } from "express";
import * as userVoucherController from "../controllers/userVoucher";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateRequest } from '../middlewares/validateRequest';
import * as userVoucherValidator from '../middlewares/validateUserVoucher';

const router = Router();

router.post("/claim/:voucherId", authMiddleware,userVoucherValidator.claimVoucherByIdData,validateRequest, userVoucherController.claimVoucherById);
router.post("/claim/code", authMiddleware,userVoucherValidator.claimVoucherByCodeData,validateRequest,userVoucherController.claimVoucherByCode);
router.get("/", authMiddleware,userVoucherController.getUserVouchers);

export default router;
