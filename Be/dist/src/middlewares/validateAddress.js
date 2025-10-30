"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressValidator = exports.addressByIdValidator = exports.addAddressValidator = void 0;
const express_validator_1 = require("express-validator");
const validateName = (0, express_validator_1.body)("name")
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters")
    .bail();
const validateAddress = (0, express_validator_1.body)("address")
    .notEmpty().withMessage("Address is required")
    .isLength({ min: 5 }).withMessage("Address must be at least 5 characters")
    .bail();
const validatePhone = (0, express_validator_1.body)("phone")
    .notEmpty().withMessage("Phone is required")
    .isMobilePhone("vi-VN").withMessage("Invalid phone number")
    .bail();
const validateIsDefault = (0, express_validator_1.body)("is_default")
    .optional()
    .isBoolean().withMessage("is_default must be true or false")
    .bail();
exports.addAddressValidator = [
    validateName,
    validateAddress,
    validatePhone,
    validateIsDefault,
];
exports.addressByIdValidator = (0, express_validator_1.param)("id")
    .isInt({ gt: 0 }).withMessage("Address id must be a positive integer");
const updateName = (0, express_validator_1.body)("name").optional().isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters").bail();
const updateAddress = (0, express_validator_1.body)("address").optional().isLength({ min: 5 }).withMessage("Address must be at least 5 characters").bail();
const updatePhone = (0, express_validator_1.body)("phone").optional().isMobilePhone("vi-VN").withMessage("Invalid phone number").bail();
const updateIsDefault = validateIsDefault; // optional rồi, dùng lại được
exports.updateAddressValidator = [
    exports.addressByIdValidator,
    updateName,
    updateAddress,
    updatePhone,
    updateIsDefault,
];
