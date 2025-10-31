import nodemailer from "nodemailer";
import { AppError } from "./appError";
export const sendMail = async (to: string, subject: string, html: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,             // Sử dụng cổng 587 (STARTTLS)
            secure: false,         // 'false' khi sử dụng cổng 587
            requireTLS: true,      // Đảm bảo sử dụng STARTTLS
            auth: {
                user: process.env.EMAIL_USER, // hoanggvanhaii0705@gmail.com
                pass: process.env.EMAIL_PASS,  // Mật khẩu Ứng dụng
            },
            // Thêm tùy chọn này để bỏ qua lỗi chứng chỉ tự ký (rất phổ biến khi deploy)
            tls: {
                rejectUnauthorized: false
            }
        });
        const mailOptions = {
            from: `"Fashion-shop" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html,

        };
        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error(err);
        throw new AppError("Failed to sendOtp", 500, false);
    }
};