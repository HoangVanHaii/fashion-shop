"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentQR = exports.checkPayment = void 0;
const vnpay_1 = require("../utils/vnpay");
const paymentService = __importStar(require("../services/payment"));
const checkPayment = async (req, res, next) => {
    try {
        const vnpParams = req.query;
        const verify = vnpay_1.vnpay.verifyReturnUrl(vnpParams);
        if (!verify.isVerified) {
            return res.redirect('http://localhost:5173/orderFailed?reason=invalid_signature');
            return res.status(400).json({
                message: "Invalid signature",
                details: verify.message
            });
        }
        const orderId = verify.vnp_TxnRef;
        const responseCode = verify.vnp_ResponseCode;
        console.log(orderId);
        if (responseCode === '00') {
            await paymentService.updatePaymentStatus(orderId, "success");
            return res.redirect(`http://localhost:5173/orderSuccess?orderId=${orderId}`);
        }
        else {
            await paymentService.updatePaymentStatus(orderId, "failed");
            return res.redirect(`http://localhost:5173/orderFailed?orderId=${orderId}&code=${responseCode}`);
        }
    }
    catch (error) {
        console.error("Error checking payment:", error);
        return res.redirect('http://localhost:5173/orderFailed?reason=server_error');
    }
};
exports.checkPayment = checkPayment;
const createPaymentQR = async (req, res, next) => {
    try {
        const { order_id, amount } = req.body;
        const paymentUrl = await (0, vnpay_1.buildPaymentUrl)(order_id, amount);
        return res.json({ paymentUrl });
    }
    catch (error) {
        console.error('Error creating payment:', error);
        next(error);
    }
};
exports.createPaymentQR = createPaymentQR;
