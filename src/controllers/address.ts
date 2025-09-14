import { Request, Response, NextFunction } from "express";
import * as addressService from "../services/address";
import { Address } from "../interfaces/address";

export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id, name, address, phone, is_default } = req.body;
        const newAddress = { user_id, name, address, phone, is_default } as Address;

        await addressService.addAddress(newAddress);

        res.status(201).json({ message: "Address added successfully" });
    } catch (error: any) {
        next(error); // đẩy sang error handler middleware
    }
};

export const getAddressesByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = parseInt(req.params.userId);
        const addresses = await addressService.getAddressesByUser(userId);

        res.json({
            success: true,
            message: "get addressById successfully",
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};

export const getAllAddressesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.query;
    const addresses = await addressService.getAllAddresses(Number(user_id));
    res.status(200).json({
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};