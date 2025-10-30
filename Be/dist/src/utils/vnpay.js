"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaymentUrl = exports.vnpay = void 0;
const vnpay_1 = require("vnpay");
exports.vnpay = new vnpay_1.VNPay({
    tmnCode: process.env.VNP_TMNCODE,
    secureSecret: process.env.VNP_HASHSECRET,
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,
    hashAlgorithm: vnpay_1.HashAlgorithm.SHA512,
    loggerFn: vnpay_1.ignoreLogger,
});
const buildPaymentUrl = async (order_id, amount) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return await exports.vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: order_id,
        vnp_OrderInfo: `Thanhtoandonhang${order_id}`,
        vnp_OrderType: vnpay_1.ProductCode.Other,
        vnp_ReturnUrl: 'http://localhost:3000/api/payments/check-payment-vnpay',
        vnp_Locale: vnpay_1.VnpLocale.VN,
        vnp_CreateDate: (0, vnpay_1.dateFormat)(new Date()),
        vnp_ExpireDate: (0, vnpay_1.dateFormat)(tomorrow),
    });
};
exports.buildPaymentUrl = buildPaymentUrl;
