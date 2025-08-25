import nodemailer from "nodemailer";

export const sendOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Mã OTP xác thực",
            text: `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`
        };

        await transporter.sendMail(mailOptions);
        return true;

    } catch (err : any) {
        console.error("Lỗi gửi OTP:", err.message);
        throw new Error("Không thể gửi OTP");
    }
}
