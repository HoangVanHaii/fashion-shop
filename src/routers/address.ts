import express from "express";
import * as addressValidator from "../middlewares/validateAddress";
import { validateRequest } from "../middlewares/validateRequest";
import * as addressController from "../controllers/address";

const router = express.Router();

router.post("/addAddress", addressValidator.addAddressValidator, validateRequest, addressController.addAddress);
router.get("/:id",addressValidator.getAddressesByUserValidator,validateRequest,addressController.getAddressesByUser);
router.get("/allAddress", addressValidator.getAddressesByUserValidator,validateRequest, addressController.getAllAddressesController);

export default router;
