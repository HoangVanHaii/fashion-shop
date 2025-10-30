"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vnpay_1 = require("../controllers/vnpay");
const router = (0, express_1.Router)();
router.post('/create-qr', vnpay_1.createPaymentQR);
router.get('/check-payment-vnpay', vnpay_1.checkPayment);
exports.default = router;
