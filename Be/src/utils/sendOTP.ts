import { Resend } from 'resend';
import { AppError } from './appError';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (to: string, subject: string, html: string) => {
    try {
        await resend.emails.send({
            from: 'noreply@fashionshopvn.site',
            to: [to],
            subject: subject,
            html: html,
        });

        console.log(`✅ Mail đã gửi đến: ${to}`);
        return true;
    } catch (err) {
        console.error('❌ Lỗi gửi mail:', err);
        throw new AppError('Failed to sendOtp', 500, false);
    }
};
