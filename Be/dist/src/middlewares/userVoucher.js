"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimVoucherByCodeData = exports.claimVoucherByIdData = void 0;
const express_validator_1 = require("express-validator");
// Claim voucher by ID
exports.claimVoucherByIdData = [
    (0, express_validator_1.param)("voucherId")
        .isInt({ gt: 0 })
        .withMessage("Voucher ID must be a positive integer"),
];
// Claim voucher by Code
exports.claimVoucherByCodeData = [
    (0, express_validator_1.body)("code")
        .notEmpty()
        .withMessage("Code is required")
        .isString()
        .withMessage("Code must be a string"),
];
