import { Request, Response, NextFunction } from "express";
import * as addressService from "../services/address";
import { Address } from "../interfaces/address";
import { AppError } from '../utils/appError';
    
export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, address, phone, is_default } = req.body;
        if (!req.user) throw new AppError("Unauthorized", 401);
        const newAddress = {
            user_id: req.user.id, // lấy từ token
            name,
            address,
            phone,
            is_default
        } as Address;

        await addressService.addAddress(newAddress);

        res.status(201).json({ message: "Address added successfully" });
    } catch (error: any) {
        next(error); // đẩy sang error handler middleware
    }
};

export const getAddressesByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new AppError("Unauthorized", 401);

        const addresses = await addressService.getAddressesByUser(req.user.id);

        res.json({
            success: true,
            message: "Get addresses successfully",
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};
export const getAddressById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const addressId = parseInt(req.params.id);
    const address = await addressService.getAddressById(req.user.id, addressId);

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    res.json({
      success: true,
      message: "Get address successfully",
      data: address
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user!.id; 
    const addressId = parseInt(req.params.id);
    const { name, address, phone, is_default } = req.body;

    const existingAddress = await addressService.getAddressById(user_id, addressId);
    if (!existingAddress) {
      throw new AppError("Address not found", 404);
    }

    const updatedAddress = {
      id: addressId,
      user_id,
      name,
      address,
      phone,
      is_default,
    } as Address;

    await addressService.updateAddress(updatedAddress);
    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user!.id;
    const addressId = parseInt(req.params.id);

    const existingAddress = await addressService.getAddressById(user_id, addressId);
    if (!existingAddress) {
      throw new AppError("Address not found", 404);
    }

    await addressService.deleteAddress(user_id, addressId,existingAddress.is_default);

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    next(error);
  }
};

