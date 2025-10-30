"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.saveOtp = void 0;
const database_1 = require("../config/database");
const appError_1 = require("../utils/appError");
const saveOtp = async (email, otp) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        await pool.request().input("email", email).query(`DELETE FROM otp_codes
              WHERE email = @email`);
        await pool.request().input("email", email).input("otp", otp)
            .query(`INSERT INTO otp_codes (email, otp, expires_at)
              VALUES(@email, @otp, DATEADD(MINUTE, 5, GETDATE()))`);
    }
    catch (err) {
        console.error(err);
        throw new appError_1.AppError("Failed to saveOtp", 500, false);
    }
};
exports.saveOtp = saveOtp;
const verifyOtp = async (email, otp) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request().input("email", email).input("otp", otp)
            .query(`SELECT email
                    FROM otp_codes
                    WHERE(email = @email
                    AND otp = @otp
                    AND expires_at > GETDATE())`);
        if (result.recordset.length > 0) {
            await pool.request().input("email", email).query(`DELETE FROM otp_codes
                WHERE email = @email`);
            return true;
        }
        return false;
    }
    catch (err) {
        console.error(err);
        throw new appError_1.AppError("Failed to verifyOtp", 500, false);
    }
};
exports.verifyOtp = verifyOtp;
