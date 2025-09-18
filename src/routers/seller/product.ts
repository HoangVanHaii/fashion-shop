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
    productController.getProducts
);
router.get("/hiddens", 
    authMiddleware, 
    isSeller, 
    productController.getProductsHidden
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
// router.put("/updateProduct",productMiddleware.updateProduct ,productController.updateProduct);
router.delete(
    "/deleteProduct", 
    authMiddleware, 
    isSeller, 
    productMiddleware.softDeleteProduct,
    validateRequest,
    productController.softDeleteProduct
);

export default router;