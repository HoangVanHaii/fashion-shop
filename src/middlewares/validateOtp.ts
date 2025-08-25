import { body } from "express-validator";


export const verifyOtpValidator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),
    body("otp")
        .notEmpty().withMessage("Otp is required")
        .isNumeric().withMessage("Otp must contain only numbers")
        .isLength({min : 6, max : 6}).withMessage("Otp must be exactly 6 digits")
]
