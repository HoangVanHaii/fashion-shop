import { body, param } from "express-validator";

// Claim voucher by ID
export const claimVoucherByIdData = [
  param("voucherId")
    .isInt({ gt: 0 })
    .withMessage("Voucher ID must be a positive integer"),
];

// Claim voucher by Code
export const claimVoucherByCodeData = [
  body("code")
    .notEmpty()
    .withMessage("Code is required")
    .isString()
    .withMessage("Code must be a string"),
];
