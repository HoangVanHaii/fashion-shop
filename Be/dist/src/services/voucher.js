"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopVouchers = exports.getVoucherByShopId = exports.getVoucherById = exports.getAllVouchers = exports.validateVoucher = exports.getVoucherByCode = exports.getVoucherIdByCode = exports.getVoucherCodeById = exports.updateVoucher = exports.createVoucher = void 0;
const database_1 = require("../config/database");
const appError_1 = require("../utils/appError");
const createVoucher = async (voucher) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `INSERT INTO vouchers (code, description, discount_type, discount_value, max_discount, min_order_value, quantity, start_date, end_date,created_by, scope, shop_id, image_url)
					   OUTPUT INSERTED.id AS voucherId
					   VALUES (@code, @description, @discount_type, @discount_value, @max_discount, @min_order_value, @quantity, @start_date, @end_date, @created_by, @scope, @shop_id, @image_url)`;
        const result = await pool
            .request()
            .input("code", voucher.code)
            .input("description", voucher.description)
            .input("discount_type", voucher.discount_type)
            .input("discount_value", voucher.discount_value)
            .input("max_discount", voucher.max_discount)
            .input("min_order_value", voucher.min_order_value)
            .input("quantity", voucher.quantity)
            .input("start_date", voucher.start_date)
            .input("end_date", voucher.end_date)
            .input("created_by", voucher.created_by)
            .input("scope", voucher.scope)
            .input("shop_id", voucher.shop_id)
            .input("image_url", voucher.image_url)
            .query(query);
        return result.recordset[0].voucherId;
    }
    catch (error) {
        console.error(error);
        throw new appError_1.AppError('Failed to create voucher', 500, false);
    }
};
exports.createVoucher = createVoucher;
const updateVoucher = async (voucher) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const request = pool.request();
        let updates = [];
        Object.entries(voucher).forEach(([key, value]) => {
            if (key !== "id" && value !== undefined) {
                updates.push(`${key} = @${key}`);
                request.input(key, value);
            }
        });
        if (updates.length === 0) {
            throw new appError_1.AppError("No fields to update", 400);
        }
        request.input("id", voucher.id);
        const query = `UPDATE vouchers
					   SET ${updates.join(", ")}
					   WHERE id = @id`;
        await request.query(query);
    }
    catch (error) {
        throw new appError_1.AppError('Failed to update voucher', 500, false);
    }
};
exports.updateVoucher = updateVoucher;
const getVoucherCodeById = async (voucher_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `SELECT code FROM vouchers WHERE id = @voucher_id`;
        const result = await pool
            .request()
            .input("voucher_id", voucher_id)
            .query(query);
        if (result.recordset.length === 0) {
            return null;
        }
        return result.recordset[0].code;
    }
    catch (error) {
        throw new appError_1.AppError('Failed to fetch voucher code', 500, false);
    }
};
exports.getVoucherCodeById = getVoucherCodeById;
const getVoucherIdByCode = async (code) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `SELECT id FROM vouchers WHERE code = @code`;
        const result = await pool
            .request()
            .input("code", code)
            .query(query);
        if (result.recordset.length === 0) {
            return null;
        }
        return result.recordset[0].id;
    }
    catch (error) {
        throw new appError_1.AppError('Failed to fetch voucher id', 500, false);
    }
};
exports.getVoucherIdByCode = getVoucherIdByCode;
const getVoucherByCode = async (code) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `SELECT * FROM vouchers WHERE code = @code`;
        const result = await pool
            .request()
            .input("code", code)
            .query(query);
        if (result.recordset.length === 0) {
            return null;
        }
        return result.recordset[0];
    }
    catch (error) {
        throw new appError_1.AppError('Failed to fetch voucher by code', 500, false);
    }
};
exports.getVoucherByCode = getVoucherByCode;
const validateVoucher = async (code, orderTotal, shop_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `SELECT * FROM vouchers WHERE code = @code`;
        const result = await pool
            .request()
            .input("code", code)
            .query(query);
        if (result.recordset.length === 0) {
            throw new appError_1.AppError("Voucher not found", 404);
        }
        const voucher = result.recordset[0];
        const now = new Date();
        const startDate = new Date(voucher.start_date);
        const endDate = new Date(voucher.end_date);
        if (startDate.getTime() > now.getTime() || endDate.getTime() < now.getTime()) {
            throw new appError_1.AppError("Voucher is not valid at this time", 400);
        }
        if (voucher.quantity <= voucher.used) {
            throw new appError_1.AppError("Voucher is no longer available", 400);
        }
        if (orderTotal < voucher.min_order_value) {
            throw new appError_1.AppError(`Order total must be at least ${voucher.min_order_value} to use this voucher`, 400);
        }
        if (voucher.scope == "SHOP" && voucher.shop_id !== shop_id) {
            throw new appError_1.AppError("Voucher is not valid for this shop", 400);
        }
        let discount = 0;
        if (voucher.discount_type === "PERCENT") {
            discount = (orderTotal * voucher.discount_value) / 100;
            if (voucher.max_discount && discount > voucher.max_discount) {
                discount = voucher.max_discount;
            }
        }
        else if (voucher.discount_type === "FIXED") {
            discount = voucher.discount_value;
        }
        return discount;
    }
    catch (error) {
        if (error instanceof appError_1.AppError) {
            throw error;
        }
        throw new appError_1.AppError('Failed to validate voucher', 500, false);
    }
};
exports.validateVoucher = validateVoucher;
const getAllVouchers = async () => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `SELECT * FROM vouchers`;
        const result = await pool.request().query(query);
        return result.recordset;
    }
    catch (error) {
        throw new appError_1.AppError('Failed to fetch vouchers', 500, false);
    }
};
exports.getAllVouchers = getAllVouchers;
const getVoucherById = async (id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `SELECT * FROM vouchers WHERE id = @id`;
        const result = await pool.request().input("id", id).query(query);
        if (result.recordset.length === 0) {
            return null;
        }
        return result.recordset[0];
    }
    catch (error) {
        throw new appError_1.AppError('Failed to fetch voucher by id', 500, false);
    }
};
exports.getVoucherById = getVoucherById;
const getVoucherByShopId = async (shop_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `SELECT * FROM vouchers WHERE shop_id = @shop_id`;
        const result = await pool.request().input("shop_id", shop_id).query(query);
        return result.recordset;
    }
    catch (error) {
        throw new appError_1.AppError('Failed to fetch vouchers by shop id', 500, false);
    }
};
exports.getVoucherByShopId = getVoucherByShopId;
const getTopVouchers = async (top, scope) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("scope", scope || "GLOBAL")
            .query(`SELECT TOP ${top} * FROM vouchers 
				WHERE scope = @scope
				ORDER BY id ASC
				`);
        return result.recordset;
    }
    catch (error) {
        throw new appError_1.AppError('Failed to fetch vouchers', 500, false);
    }
};
exports.getTopVouchers = getTopVouchers;
