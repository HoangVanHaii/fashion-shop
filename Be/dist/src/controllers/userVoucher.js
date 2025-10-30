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
exports.getUserVouchers = exports.claimVoucherByCode = exports.claimVoucherById = void 0;
const userVoucherService = __importStar(require("../services/userVoucher"));
const claimVoucherById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const voucherId = parseInt(req.params.voucherId);
        await userVoucherService.claimVoucherById({
            user_id: userId,
            voucher_id: voucherId,
        });
        res.status(201).json({
            success: true,
            message: "Voucher claimed successfully"
        });
    }
    catch (error) {
        next(error);
    }
};
exports.claimVoucherById = claimVoucherById;
const claimVoucherByCode = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;
        await userVoucherService.claimVoucherByCode(userId, code);
        res.status(201).json({
            success: true,
            message: "Voucher claimed successfully"
        });
    }
    catch (error) {
        next(error);
    }
};
exports.claimVoucherByCode = claimVoucherByCode;
const getUserVouchers = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const vouchers = await userVoucherService.getUserVouchers(userId);
        res.status(200).json({
            success: true,
            data: vouchers,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserVouchers = getUserVouchers;
