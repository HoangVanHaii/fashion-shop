import { Request, Response, NextFunction } from "express";
import * as userVoucherService from "../services/userVoucher";
import { AppError } from "../utils/appError";

export const claimVoucherById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const voucherId = parseInt(req.params.voucherId);
        await userVoucherService.claimVoucherById({
            user_id: userId,
            voucher_id: voucherId,
        });

        res.status(201).json({
            success: true,
            message: "Voucher claimed successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const claimVoucherByCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { code } = req.body;
        await userVoucherService.claimVoucherByCode(userId, code);

        res.status(201).json({
            success: true,
            message: "Voucher claimed successfully"
        });
    } catch (error) {
        next(error);
    }
};


export const getUserVouchers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const vouchers = await userVoucherService.getUserVouchers(userId);
        res.status(200).json({
            success: true,
            data: vouchers,
        });
    } catch (error) {
        next(error);
    }
};