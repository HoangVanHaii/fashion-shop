import { Router } from "express";
import * as flashSaleController from "../controllers/flashSale";
import { authMiddleware, isAdmin, isSeller } from "../middlewares/authMiddleware";
import * as flashSaleValidate from "../middlewares/validateFLashSale";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();
router.get("/newFlashSale", flashSaleController.getFlashSaleHome);
router.get("/activeNotIn", flashSaleController.getFlashSaleHotDeal);
router.get("/totalSold/:id", flashSaleController.getTotalSoldFlashSaleById);

router.post(
    "/",
    authMiddleware,
    isAdmin,
    flashSaleValidate.validateCreateFlashSale,
    validateRequest,
    flashSaleController.createFlashSale
);
router.post(
    "/item/:id",
    authMiddleware,
    isSeller,
    flashSaleValidate.validateAddFlashSaleItem,
    validateRequest,
    flashSaleController.addFlashSaleItem
);

router.get(
    "/detail",
    authMiddleware,
    flashSaleController.getAllFlashSaleDetails
);
router.get("/seller", authMiddleware, isSeller, flashSaleController.getAllFlashSaleForSeller);
router.get("/" , authMiddleware, isSeller, flashSaleController.getAllFlashSales);
router.get(
    "/:id",
    flashSaleValidate.validateId,
    validateRequest,
    flashSaleController.getFlashSaleById
);
router.put(
    "/item/:id",
    authMiddleware, isSeller,
    flashSaleValidate.validateUpdateFlashSaleItem,
    validateRequest,
    flashSaleController.updateFlashSaleItem
);

router.put(
    "/:id",
    authMiddleware, isAdmin,
    flashSaleValidate.validateUpdateFlashSale,
    validateRequest,
    flashSaleController.updateFlashSales
);

router.delete(
    "/:id",
    authMiddleware,
    isAdmin,
    flashSaleValidate.validateId,
    validateRequest,
    flashSaleController.cancelFlashSale
);
router.delete("/allFlashItem/:id", authMiddleware, isSeller, flashSaleValidate.validateId, validateRequest, flashSaleController.cancelAllFlashSaleItemsForSeller)
router.delete(
    "/item/:id",
    authMiddleware,
    isSeller,
    flashSaleValidate.validateId,
    validateRequest,
    flashSaleController.removeFlashSaleItem
);

export default router;
