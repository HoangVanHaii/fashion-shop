"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeLogoValidator = exports.paramsShopId = exports.createSellerRequestValidator = exports.resetPasswordValidator = exports.verifyForgotPasswordValidator = exports.forgotPasswordValidator = exports.verifyChangeEmailValidator = exports.changeEmailValidator = exports.changePasswordValidator = exports.updateUserByAdminValidator = exports.updateUserValidator = exports.verifyOtpValidator = exports.refreshTokenValidator = exports.loginValidator = exports.createUserByAdminValidator = exports.resendOtpValidator = exports.registerValidator = exports.avatarValidator = exports.idValidator = void 0;
const express_validator_1 = require("express-validator");
const dateOfBirthValidator = (0, express_validator_1.body)("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of Birth must be a valid date");
const emailValidator = (0, express_validator_1.body)("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format");
const phoneValidator = (0, express_validator_1.body)("phone")
    .notEmpty().withMessage("Phone number is required")
    .matches(/^(0|\+84)[0-9]{9}$/).withMessage("Invalid phone number format");
const genderValidator = (0, express_validator_1.body)("gender")
    .optional({ checkFalsy: true })
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be either 'male', 'female', 'other'!");
const newEmailValidator = (0, express_validator_1.body)("newEmail")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format");
const passwordValidator = (0, express_validator_1.body)("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters");
const otpValidator = (0, express_validator_1.body)("otp")
    .notEmpty()
    .withMessage("Otp is required")
    .isNumeric()
    .withMessage("Otp must contain only nymbers")
    .isLength({ min: 6, max: 6 })
    .withMessage("Otp must be exactly 6 digits");
exports.idValidator = (0, express_validator_1.param)("id")
    .isInt({ gt: 0 }).withMessage("ID must be a positive integer");
exports.avatarValidator = (0, express_validator_1.body)("avatar");
(0, express_validator_1.body)("avatar").custom((_, { req }) => {
    if (!req.file) {
        throw new Error("Logo file is required");
    }
    return true;
});
exports.registerValidator = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),
    phoneValidator,
    emailValidator,
    passwordValidator,
    dateOfBirthValidator,
    (0, express_validator_1.body)("role")
        .optional()
        .isIn(["customer", "seller", "admin"])
        .withMessage("Role must be either 'customer', 'seller' or 'admin"),
    genderValidator
];
exports.resendOtpValidator = (0, express_validator_1.body)("email");
emailValidator;
exports.createUserByAdminValidator = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),
    phoneValidator,
    emailValidator,
    dateOfBirthValidator,
    (0, express_validator_1.body)("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["customer", "seller", "admin"])
        .withMessage("Role must be either 'customer', 'seller' or 'admin"),
    genderValidator
];
exports.loginValidator = [emailValidator, passwordValidator];
exports.refreshTokenValidator = [
    (0, express_validator_1.body)("refreshToken").notEmpty().withMessage("refreshToken is required"),
];
exports.verifyOtpValidator = [emailValidator, otpValidator];
exports.updateUserValidator = [
    (0, express_validator_1.body)("name")
        .optional({ checkFalsy: true })
        .isLength({ min: 3, max: 50 })
        .withMessage("Name must be between 3 and 50 characters"),
    dateOfBirthValidator,
    (0, express_validator_1.body)("phone")
        .optional({ checkFalsy: true })
        .notEmpty()
        .withMessage("Phone number is required")
        .isMobilePhone("any")
        .withMessage("Invalid phone number"),
    genderValidator
];
exports.updateUserByAdminValidator = [
    (0, express_validator_1.param)("id")
        .isInt({ gt: 0 })
        .withMessage("ID must be a positive integer"),
    (0, express_validator_1.body)("name")
        .optional({ checkFalsy: true })
        .isLength({ min: 3, max: 50 })
        .withMessage("Name must be between 3 and 50 characters"),
    dateOfBirthValidator,
    (0, express_validator_1.body)("role")
        .optional({ checkFalsy: true })
        .isIn(["customer", "seller", "admin"])
        .withMessage("Role must be either 'customer', 'seller' or 'admin"),
    (0, express_validator_1.body)("status")
        .optional({ checkFalsy: true })
        .isIn(["active", "banned"])
        .withMessage("Status must be either 'active' or 'banned"),
    (0, express_validator_1.body)("is_verified")
        .optional({ checkFalsy: true })
        .isBoolean()
        .withMessage("is_verified must be a boolean"),
];
exports.changePasswordValidator = [
    passwordValidator,
    (0, express_validator_1.body)("newPassword")
        .notEmpty()
        .withMessage("NewPassword is required")
        .isLength({ min: 3 })
        .withMessage("NewPassword must be at least 3 characters"),
];
exports.changeEmailValidator = [newEmailValidator, passwordValidator];
exports.verifyChangeEmailValidator = [newEmailValidator, otpValidator];
exports.forgotPasswordValidator = [
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("Invalid email format"),
];
exports.verifyForgotPasswordValidator = [emailValidator, otpValidator];
exports.resetPasswordValidator = [
    emailValidator,
    (0, express_validator_1.body)("newPassword")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 3 })
        .withMessage("Password must be at least 3 characters"),
];
///////////////////////////
exports.createSellerRequestValidator = [
    (0, express_validator_1.body)("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
    (0, express_validator_1.body)("phone")
        .notEmpty().withMessage("Phone number is required")
        .matches(/^(0|\+84)[0-9]{9}$/).withMessage("Invalid phone number format"),
    (0, express_validator_1.body)("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),
    (0, express_validator_1.body)("address")
        .notEmpty().withMessage("Address is required"),
    (0, express_validator_1.body)("cccd")
        .notEmpty().withMessage("CCCD is required")
        .isLength({ min: 9, max: 12 }).withMessage("Invalid CCCD length"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 255 }).withMessage("Description too long (max 255 chars)")
];
exports.paramsShopId = (0, express_validator_1.param)("id")
    .isInt({ gt: 0 }).withMessage("Id must be a positive integer");
exports.changeLogoValidator = [
    exports.paramsShopId,
    (0, express_validator_1.body)("logo").custom((_, { req }) => {
        if (!req.file) {
            throw new Error("Logo file is required");
        }
        return true;
    })
];
