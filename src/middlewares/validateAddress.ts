import { body,param } from "express-validator";

const validateName = body("name")
  .notEmpty().withMessage("Name is required")
  .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters")
  .bail();

const validateAddress = body("address")
  .notEmpty().withMessage("Address is required")
  .isLength({ min: 5 }).withMessage("Address must be at least 5 characters")
  .bail();

const validatePhone = body("phone")
  .notEmpty().withMessage("Phone is required")
  .isMobilePhone("vi-VN").withMessage("Invalid phone number")
  .bail();

const validateIsDefault = body("is_default")
  .optional()
  .isBoolean().withMessage("is_default must be true or false")
  .bail();

// --- Validators for API ---
export const addAddressValidator = [
  validateName,
  validateAddress,
  validatePhone,
  validateIsDefault,
];

export const addressByIdValidator = param("id")
    .isInt({ gt: 0 }).withMessage("Address id must be a positive integer")
;

const updateName = body("name").optional().isLength({ min: 3, max: 50 }).withMessage("Name must be between 3 and 50 characters").bail();
const updateAddress = body("address").optional().isLength({ min: 5 }).withMessage("Address must be at least 5 characters").bail();
const updatePhone = body("phone").optional().isMobilePhone("vi-VN").withMessage("Invalid phone number").bail();
const updateIsDefault = validateIsDefault; // optional rồi, dùng lại được

export const updateAddressValidator = [
  addressByIdValidator,
  updateName,
  updateAddress,
  updatePhone,
  updateIsDefault,
];
