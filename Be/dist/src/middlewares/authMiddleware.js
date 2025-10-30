"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrSeller = exports.isSeller = exports.isAdmin = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = require("../utils/appError");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new appError_1.AppError("Token is required", 401);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new appError_1.AppError("Token expired", 401);
        }
        else {
            throw new appError_1.AppError("Invalid token", 401);
        }
    }
};
exports.authMiddleware = authMiddleware;
const isAdmin = (req, res, next) => {
    const role = req.user?.role;
    if (role !== "admin") {
        throw new appError_1.AppError('Forbidden: Admins only ', 403);
    }
    next();
};
exports.isAdmin = isAdmin;
const isSeller = (req, res, next) => {
    const role = req.user?.role;
    if (role !== "seller") {
        throw new appError_1.AppError('Forbidden: Sellers only ', 403);
    }
    next();
};
exports.isSeller = isSeller;
const adminOrSeller = (req, res, next) => {
    const role = req.user?.role;
    if (role !== "admin" && role !== "seller") {
        throw new appError_1.AppError('Forbidden: Admins or Sellers only ', 403);
    }
    next();
};
exports.adminOrSeller = adminOrSeller;
