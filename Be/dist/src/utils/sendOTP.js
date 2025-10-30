"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const appError_1 = require("./appError");
const sendMail = async (to, subject, html) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            from: `"Fashion-shop" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: html,
        };
        await transporter.sendMail(mailOptions);
        return true;
    }
    catch (err) {
        console.error(err);
        throw new appError_1.AppError("Failed to sendOtp", 500, false);
    }
};
exports.sendMail = sendMail;
