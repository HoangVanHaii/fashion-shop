import { body, param } from "express-validator";

const dateOfBirthValidator = body("dateOfBirth")
  .optional()
  .isISO8601()
  .withMessage("Date of Birth must be a valid date")

const emailValidator = body("email")
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Invalid email format");

const phoneValidator = body("phone")
  .notEmpty()
  .withMessage("Phone number is required")
  .isMobilePhone("any")
  .withMessage("Invalid phone number");

const newEmailValidator = body("newEmail")
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Invalid email format");

const passwordValidator = body("password")
  .notEmpty()
  .withMessage("Password is required")
  .isLength({ min: 3 })
  .withMessage("Password must be at least 3 characters");

const otpValidator = body("otp")
  .notEmpty()
  .withMessage("Otp is required")
  .isNumeric()
  .withMessage("Otp must contain only nymbers")
  .isLength({ min: 6, max: 6 })
  .withMessage("Otp must be exactly 6 digits");

export const idValidator = param("id")
  .isInt({ gt: 0 }).withMessage("ID must be a positive integer");

export const avatarValidator = body("avatar")
  .isURL()
  .withMessage("Avatar must be a valid URL");

export const registerValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  phoneValidator,
  emailValidator,
  passwordValidator,
  dateOfBirthValidator,
  body("role")
    .optional()
    .isIn(["customer", "seller", "admin"])
    .withMessage("Role must be either 'customer', 'seller' or 'admin"),
];

export const createUserByAdminValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  phoneValidator,
  emailValidator,
  dateOfBirthValidator,
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["customer", "seller", "admin"])
    .withMessage("Role must be either 'customer', 'seller' or 'admin"),
]

export const loginValidator = [emailValidator, passwordValidator];

export const refreshTokenValidator = [
  body("refreshToken").notEmpty().withMessage("refreshToken is required"),
];

export const verifyOtpValidator = [emailValidator, otpValidator];

export const updateUserValidator = [
  body("name")
    .optional({ checkFalsy: true })
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters"),
  dateOfBirthValidator
];

export const updateUserByAdminValidator = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("ID must be a positive integer"),
  body("name")
    .optional({ checkFalsy: true })
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters"),
  dateOfBirthValidator,
  body("role")
    .optional({ checkFalsy: true })
    .isIn(["customer", "seller", "admin"])
    .withMessage("Role must be either 'customer', 'seller' or 'admin"),
  body("status")
    .optional({ checkFalsy: true })
    .isIn(["active", "banned"])
    .withMessage("Status must be either 'active' or 'banned"),
  body("is_verified")
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage("is_verified must be a boolean"),
]

export const changePasswordValidator = [
  passwordValidator,
  body("newPassword")
    .notEmpty()
    .withMessage("NewPassword is required")
    .isLength({ min: 3 })
    .withMessage("NewPassword must be at least 3 characters"),
];

export const changePhoneValidator = [
  body("newPhone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
  passwordValidator,
];

export const changeEmailValidator = [newEmailValidator, passwordValidator];

export const verifyChangeEmailValidator = [newEmailValidator, otpValidator];

export const forgotPasswordValidator = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email format"),
];
export const verifyForgotPasswordValidator = [emailValidator, otpValidator];

export const resetPasswordValidator = [
  emailValidator,
  body("newPassword")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters"),
];

