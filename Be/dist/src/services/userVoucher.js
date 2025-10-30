"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserVouchers = exports.claimVoucherByCode = exports.claimVoucherById = void 0;
const database_1 = require("../config/database");
const appError_1 = require("../utils/appError");
const claimVoucherById = async (uservoucher) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        //check hạn sử dụng
        const voucher = await pool.request()
            .input('voucherId', uservoucher.voucher_id)
            .query(`
            SELECT * FROM vouchers 
            WHERE id = @voucherId 
            AND start_date <= GETDATE() 
            AND end_date >= GETDATE() 
            AND quantity > 0
            `);
        if (voucher.recordset.length === 0) {
            throw new appError_1.AppError("Voucher is invalid or expired", 400);
        }
        //check claim
        const exist = await pool.request()
            .input("userId", uservoucher.user_id)
            .input("voucherId", uservoucher.voucher_id)
            .query(`
                SELECT * FROM user_vouchers
                WHERE user_id = @userId AND voucher_id = @voucherId
            `);
        if (exist.recordset.length > 0) {
            throw new appError_1.AppError("You already claimed this voucher", 400);
        }
        // Claim voucher
        await pool.request()
            .input("userId", uservoucher.user_id)
            .input("voucherId", uservoucher.voucher_id)
            .query(`
                INSERT INTO user_vouchers (user_id, voucher_id)
                VALUES (@userId, @voucherId)
            `);
        // Giảm số lượng voucher
        await pool.request()
            .input("voucherId", uservoucher.voucher_id)
            .query(`
            UPDATE vouchers SET quantity = quantity - 1
            WHERE id = @voucherId
        `);
    }
    catch (error) {
        if (error instanceof appError_1.AppError) {
            throw error;
        }
        throw new appError_1.AppError("Failed to claim voucher", 500, false);
    }
};
exports.claimVoucherById = claimVoucherById;
const claimVoucherByCode = async (userId, code) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        // Tìm voucher theo code
        const voucher = await pool.request()
            .input("code", code)
            .query(`
        SELECT * FROM vouchers 
        WHERE code = @code
          AND start_date <= GETDATE() 
          AND end_date >= GETDATE() 
          AND quantity > 0
      `);
        if (voucher.recordset.length === 0) {
            throw new appError_1.AppError("Voucher is invalid or expired", 400);
        }
        const voucherId = voucher.recordset[0].id;
        // Check user đã claim chưa
        const exist = await pool.request()
            .input("userId", userId)
            .input("voucherId", voucherId)
            .query(`
        SELECT * FROM user_vouchers
        WHERE user_id = @userId AND voucher_id = @voucherId
      `);
        if (exist.recordset.length > 0) {
            throw new appError_1.AppError("You already claimed this voucher", 400);
        }
        // Claim voucher
        await pool.request()
            .input("userId", userId)
            .input("voucherId", voucherId)
            .query(`
        INSERT INTO user_vouchers (user_id, voucher_id, used_date)
        VALUES (@userId, @voucherId, NULL)
      `);
        // Giảm số lượng voucher
        await pool.request()
            .input("voucherId", voucherId)
            .query(`
        UPDATE vouchers SET quantity = quantity - 1
        WHERE id = @voucherId
      `);
    }
    catch (error) {
        throw new appError_1.AppError("Failed to claim voucher", 500, false);
    }
};
exports.claimVoucherByCode = claimVoucherByCode;
const getUserVouchers = async (userId) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("userId", userId)
            .query(`
          SELECT uv.id, v.id as voucher_id, v.code, v.description, v.discount_type,  
                v.discount_value, v.start_date, v.end_date, uv.used_date
          FROM user_vouchers uv
          INNER JOIN vouchers v ON uv.voucher_id = v.id
          WHERE uv.user_id = @userId
        `);
        return result.recordset;
    }
    catch (error) {
        throw new appError_1.AppError("Failed to fetch user vouchers", 500, false);
    }
};
exports.getUserVouchers = getUserVouchers;
