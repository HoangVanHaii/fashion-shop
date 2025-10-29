import express from "express";
import *as productController from "../../controllers/seller/product";
import *as productMiddleware from "../../middlewares/validateProduct";
import { validateRequest } from "../../middlewares/validateRequest";
import { uploadProductImages } from "../../utils/uploadProduct"
import { isAdmin, isSeller, authMiddleware } from "../../middlewares/authMiddleware";
const router = express.Router();

router.get(
    "/",
    authMiddleware,
    isSeller,
    productController.getAllProductsByShop
);
router.get(
    "/hidden", 
    authMiddleware, 
    isSeller, 
    productController.getAllProductsHiddenByShop
);
router.post(
    "/addProduct", 
    authMiddleware, 
    isSeller, 
    uploadProductImages,
    productMiddleware.AddProduct, 
    validateRequest,
    productController.addProduct
);
router.put("/updateStatus", authMiddleware, isSeller, productController.updateProductStatus);
router.put("/updateSizes", authMiddleware, isSeller, productController.updateSizes);
router.put("/:id", authMiddleware, isSeller, uploadProductImages, productMiddleware.updateProduct, validateRequest, productController.updateProduct);

router.delete(
    "/deleteProduct", 
    authMiddleware, 
    isSeller, 
    productMiddleware.softDeleteProduct,
    validateRequest,
    productController.softDeleteProduct
);

export default router;