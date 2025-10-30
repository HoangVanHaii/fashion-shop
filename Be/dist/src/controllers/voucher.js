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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopVouchers = exports.updateVoucher = exports.createVoucher = exports.getVoucherByShopIdForUser = exports.getVoucherByShopId = exports.getVoucherById = exports.getAllVouchers = exports.getVoucherByCode = exports.getVoucherCodeById = void 0;
const voucherService = __importStar(require("../services/voucher"));
const redisClient_1 = __importDefault(require("../config/redisClient"));
const getVoucherCodeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const voucherCode = await voucherService.getVoucherCodeById(parseInt(id));
        if (!voucherCode) {
            return res.status(404).json({ message: 'Voucher not found' });
        }
        return res.status(200).json({ voucherCode });
    }
    catch (err) {
        next(err);
    }
};
exports.getVoucherCodeById = getVoucherCodeById;
const getVoucherByCode = async (req, res, next) => {
    try {
        const { code } = req.params;
        const voucher = await voucherService.getVoucherByCode(code);
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }
        return res.status(200).json({ voucher });
    }
    catch (err) {
        next(err);
    }
};
exports.getVoucherByCode = getVoucherByCode;
const getAllVouchers = async (req, res, next) => {
    try {
        const vouchers = await voucherService.getAllVouchers();
        return res.status(200).json({ vouchers });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllVouchers = getAllVouchers;
const getVoucherById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const voucher = await voucherService.getVoucherById(parseInt(id));
        if (!voucher) {
            return res.status(404).json({ message: 'Voucher not found' });
        }
        return res.status(200).json({ voucher });
    }
    catch (err) {
        next(err);
    }
};
exports.getVoucherById = getVoucherById;
const getVoucherByShopId = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const vouchers = await voucherService.getVoucherByShopId(user_id);
        return res.status(200).json({ vouchers });
    }
    catch (err) {
        next(err);
    }
};
exports.getVoucherByShopId = getVoucherByShopId;
const getVoucherByShopIdForUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const vouchers = await voucherService.getVoucherByShopId(id);
        return res.status(200).json({ vouchers });
    }
    catch (err) {
        next(err);
    }
};
exports.getVoucherByShopIdForUser = getVoucherByShopIdForUser;
const createVoucher = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { code, description, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, usage_limit, scope } = req.body;
        let shop_id = null;
        if (scope === 'SHOP') {
            // shop_id = await userService.getShopIdByUserId(user_id);
            shop_id = 3;
        }
        const file = req.file;
        const image_url = file ? `/uploads/vouchers/${file.filename}` : '';
        const voucher = {
            code,
            description,
            discount_type,
            discount_value,
            max_discount,
            min_order_value,
            quantity: usage_limit,
            start_date,
            end_date,
            created_by: user_id,
            scope: scope,
            shop_id: shop_id,
            image_url
        };
        await voucherService.createVoucher(voucher);
        return res.status(201).json({ message: 'Voucher created successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.createVoucher = createVoucher;
const updateVoucher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code, description, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, usage_limit } = req.body;
        const voucher = {
            id: parseInt(id),
            code,
            description,
            discount_type,
            discount_value,
            max_discount,
            min_order_value,
            start_date,
            end_date,
            quantity: usage_limit,
        };
        await voucherService.updateVoucher(voucher);
        return res.status(200).json({ message: 'Voucher updated successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.updateVoucher = updateVoucher;
const getTopVouchers = async (req, res, next) => {
    try {
        const top = req.query.top ? parseInt(req.query.top, 10) : 4;
        const scope = req.query.scope || "GLOBAL";
        const cacheKey = `Voucher${scope}${top}`;
        const cachedData = await redisClient_1.default.get(cacheKey);
        if (cachedData) {
            console.log(`Cache hit ${cacheKey}`);
            const vouchers = JSON.parse(cachedData);
            return res.status(200).json({
                success: true,
                vouchers
            });
        }
        const vouchers = await voucherService.getTopVouchers(top, scope);
        await redisClient_1.default.setEx(cacheKey, 300, JSON.stringify(vouchers));
        console.log("Cache miss → saved new data");
        return res.status(200).json({
            success: true,
            vouchers
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getTopVouchers = getTopVouchers;
