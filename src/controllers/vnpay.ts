import e, { Request, Response, NextFunction } from 'express';
import { buildPaymentUrl } from '../utils/vnpay';
import dotenv from 'dotenv';
import *as paymentService from '../services/payment'
import crypto from 'crypto';
import { HashAlgorithm } from 'vnpay';
dotenv.config();

export const createPaymentQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id, amount } = req.body;

        const paymentUrl = await buildPaymentUrl(order_id, amount);
        return res.json({ paymentUrl });
    } catch (error) {
        console.error('Error creating payment:', error);
        next(error);
    }
};

export const checkPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vnpParams: any = { ...req.query };
        const secureHash = vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHash'];
        delete vnpParams['vnp_SecureHashType'];

        // B1: sort params lại
        const sortedKeys = Object.keys(vnpParams).sort();
        const signData = sortedKeys.map(k => `${k}=${vnpParams[k]}`).join('&');

        // B2: tính lại hash với secretKey
        const secretKey = process.env.VNP_HASHSECRET as string;
        const checkHash = crypto
            .createHmac(HashAlgorithm.SHA512, secretKey)
            .update(signData)
            .digest("hex");

        if (checkHash !== secureHash) {
            return res.status(400).json({ message: "Invalid signature" });
        }

        const orderId = vnpParams['vnp_TxnRef'];  // chính là id order bạn gửi sang
        const responseCode = vnpParams['vnp_ResponseCode'];

        if (responseCode === '00') {
            await paymentService.updatePaymentStatus(orderId, "success");
            return res.json({ message: "Payment success", orderId });
        } else {
            await paymentService.updatePaymentStatus(orderId, "failed");
            return res.status(400).json({ message: "Payment failed", orderId, code: responseCode });
        }

    } catch (error) {
        console.error("Error checking payment:", error);
        next(error);
    }
};
