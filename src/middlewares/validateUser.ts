import { body } from "express-validator"

const emailValidator = body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")

const newEmailValidator = body("newEmail")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    
const passwordValidator = body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 3 }).withMessage("Password must be at least 3 characters")

const otpValidator = body("otp")
    .notEmpty().withMessage("Otp is required")
    .isNumeric().withMessage("Otp must contain only nymbers")
    .isLength({min: 6, max: 6}).withMessage("Otp must be exactly 6 digits")

export const registerValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 3, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    emailValidator,
    passwordValidator,
    body("role")
        .optional()
        .isIn(["customer", "seller", "admin"]).withMessage("Role must be either 'customer', 'seller' or 'admin")
]

export const loginValidator = [
    emailValidator,
    passwordValidator
]

export const refreshTokenValidator = [
    body("refreshToken").notEmpty().withMessage("refreshToken is required")
]

export const verifyOtpValidator = [
    emailValidator,
    otpValidator
]

export const updateUserValidator = [
    body("name")
        .optional({checkFalsy: true})
        .isLength({ min: 3, max: 50}).withMessage("Name must be between 3 and 50 characters"),
    body("address")
        .optional({checkFalsy: true})
        .isLength({min: 3}).withMessage("Address must be at least 3 characters,")
]   

export const changePasswordValidator = [
    passwordValidator,
    body("newPassword")
        .notEmpty().withMessage("NewPassword is required")
        .isLength({ min: 3 }).withMessage("NewPassword must be at least 3 characters")
    
]
export const changeEmailValidator = [
    newEmailValidator,
    passwordValidator,
]

export const verifyChangeEmailValidator = [
    newEmailValidator,
    otpValidator
]
export const forgotPasswordValidator = [
    body("email")
        .notEmpty().withMessage("email is required")
        .isEmail().withMessage("Invalid email format")
]
export const verifyForgotPasswordValidator = [
    emailValidator,
    otpValidator
]
export const resetPasswordValidator = [
    emailValidator,
    body("newPassword")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 3 }).withMessage("Password must be at least 3 characters")
]
