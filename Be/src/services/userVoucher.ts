import { connectionDB } from "../config/database";
import { AppError } from "../utils/appError";
import { UserVoucher } from "../interfaces/userVoucher";

export const claimVoucherById = async (uservoucher: UserVoucher): Promise<void> => {
    try {
        const pool = await connectionDB();
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
            throw new AppError("Voucher is invalid or expired", 400);
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
            throw new AppError("You already claimed this voucher", 400);
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
    } catch (error: any) {
        throw new AppError("Failed to claim voucher", 500, false);
    }

};

export const claimVoucherByCode = async (userId: number, code: string): Promise<void> => {
    try {
        const pool = await connectionDB();

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
            throw new AppError("Voucher is invalid or expired", 400);
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
            throw new AppError("You already claimed this voucher", 400);
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

    } catch (error: any) {
        throw new AppError("Failed to claim voucher", 500, false);
    }
};

export const getUserVouchers = async (userId: number) => {
    try {
        const pool = await connectionDB();

        const result = await pool.request()
            .input("userId", userId)
            .query(`
          SELECT uv.id as user_voucher_id, v.code, v.description, v.discount_type, 
                v.discount_value, v.start_date, v.end_date, uv.used_date
          FROM user_vouchers uv
          INNER JOIN vouchers v ON uv.voucher_id = v.id
          WHERE uv.user_id = @userId
        `);
        return result.recordset;

    } catch (error: any) {
        throw new AppError("Failed to fetch user vouchers", 500, false);
    }
};