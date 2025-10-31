import nodemailer from "nodemailer";
import { AppError } from "./appError";
export const sendMail = async (to: string, subject: string, html: string) => {
  try {
      const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
          tls: {
              rejectUnauthorized: false
          }
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
