import nodemailer from "nodemailer";
import { AppError } from "./appError";
export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
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
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to sendOtp", 500, false);
  }
};
