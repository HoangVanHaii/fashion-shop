import express from "express";
import * as addressValidator from "../middlewares/validateAddress";
import { validateRequest } from "../middlewares/validateRequest";
import * as addressController from "../controllers/address";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/addAddress", authMiddleware,addressValidator.addAddressValidator, validateRequest, addressController.addAddress);
router.get("/getAddressesByUser",authMiddleware,validateRequest,addressController.getAddressesByUser);
router.get("/:id",authMiddleware,addressValidator.AddressByIdValidator,validateRequest,addressController.getAddressById);
router.put("/:id",authMiddleware,addressValidator.updateAddressValidator,validateRequest,addressController.updateAddress);
router.delete("/:id",authMiddleware,addressValidator.AddressByIdValidator,validateRequest,addressController.deleteAddress
);


export default router;
