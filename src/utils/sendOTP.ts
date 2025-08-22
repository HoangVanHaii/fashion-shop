import { query } from "mssql";
import { connectionDB } from "../config/database";
import nodemailer from "nodemailer";


export const sendOtp = async (email: string): Promise<boolean> => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Mã OTP xác thực",
            text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`
        };

        await transporter.sendMail(mailOptions);
        const pool = await connectionDB();

        await pool.request()
            .input("email", email)
            .query(`DELETE FROM otp_codes
                WHERE email = @email`);

        await pool.request()
            .input("email", email)
            .input("otp", otp)
            .query(`INSERT INTO otp_codes (email, otp, expires_at)
                VALUES(@email, @otp, DATEADD(MINUTE, 5, GETDATE()))`);
        console.log(email, otp);
        return true;

    } catch (err : any) {
        console.error("Lỗi gửi OTP:", err.message);
        throw new Error("Không thể gửi OTP");
    }
}
export const verifyOtp = async (email: string, otp: string) => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("email", email)
            .input("otp", otp)
            .query(`SELECT email
                    FROM otp_codes
                    WHERE(email = @email
                    AND otp = @otp
                    AND expires_at > GETDATE())`);
        
        if (result.recordset.length > 0) {
            await pool.request()
            .input("email", email)
            .query(`DELETE FROM otp_codes
                WHERE email = @email`);
        
            return true;
        }
        return false;
    } catch (err: any) {
        console.error("Lỗi xác thực OTP:", err.message);
        throw new Error("Lỗi xác thực OTP");
    }

}