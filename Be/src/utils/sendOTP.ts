import nodemailer from "nodemailer";
import { AppError } from "./appError";

export const sendMail = async (to: string, subject: string, html: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.sendgrid.net",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_USER, // Phải là "apikey"
                pass: process.env.EMAIL_PASS,  // Phải là API Key (SG.xxxx)
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Fashion-shop" <hoanggvanhaii0705@gmail.com>`,
            to: to,
            subject: subject,
            html: html, // Dùng 'html' vì tham số đầu vào là 'html'
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (err) {
        console.error("Lỗi gửi mail với SendGrid:", err);
        throw new AppError("Failed to sendOtp", 500, false);
    }
};