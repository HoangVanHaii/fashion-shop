"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.getAddressById = exports.getAddressesByUser = exports.addAddress = void 0;
const addressService = __importStar(require("../services/address"));
const appError_1 = require("../utils/appError");
const addAddress = async (req, res, next) => {
    try {
        const { name, address, phone, is_default } = req.body;
        if (!req.user)
            throw new appError_1.AppError("Unauthorized", 401);
        const newAddress = {
            user_id: req.user.id, // lấy từ token
            name,
            address,
            phone,
            is_default
        };
        await addressService.addAddress(newAddress);
        res.status(201).json({ message: "Address added successfully" });
    }
    catch (error) {
        next(error); // đẩy sang error handler middleware
    }
};
exports.addAddress = addAddress;
const getAddressesByUser = async (req, res, next) => {
    try {
        if (!req.user)
            throw new appError_1.AppError("Unauthorized", 401);
        const addresses = await addressService.getAddressesByUser(req.user.id);
        res.json({
            success: true,
            message: "Get addresses successfully",
            data: addresses
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAddressesByUser = getAddressesByUser;
const getAddressById = async (req, res, next) => {
    try {
        if (!req.user)
            throw new appError_1.AppError("Unauthorized", 401);
        const addressId = parseInt(req.params.id);
        const address = await addressService.getAddressById(req.user.id, addressId);
        if (!address) {
            throw new appError_1.AppError("Address not found", 404);
        }
        res.json({
            success: true,
            message: "Get address successfully",
            data: address
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAddressById = getAddressById;
const updateAddress = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const addressId = parseInt(req.params.id);
        const { name, address, phone, is_default } = req.body;
        const existingAddress = await addressService.getAddressById(user_id, addressId);
        if (!existingAddress) {
            throw new appError_1.AppError("Address not found", 404);
        }
        const updatedAddress = {
            id: addressId,
            user_id,
            name,
            address,
            phone,
            is_default,
        };
        await addressService.updateAddress(updatedAddress);
        res.status(200).json({ message: "Address updated successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const addressId = parseInt(req.params.id);
        const existingAddress = await addressService.getAddressById(user_id, addressId);
        if (!existingAddress) {
            throw new appError_1.AppError("Address not found", 404);
        }
        await addressService.deleteAddress(user_id, addressId, existingAddress.is_default);
        res.status(200).json({ message: "Address deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
