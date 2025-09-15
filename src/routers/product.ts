import express from "express";
import *as productController from "../controllers/product";
import *as productMiddleware from "../middlewares/validateProduct";
import { validateRequest } from "../middlewares/validateRequest";
import { uploadProductImages } from "../utils/uploadProduct"
import { isAdmin, isSeller, authMiddleware } from "../middlewares/authMiddleware";
const router = express.Router();

router.get(
    "/",
    authMiddleware,
    isSeller,
    productController.getProducts
);
router.get(
    "/searchByName",
    productMiddleware.validateSearchByName,
    validateRequest,
    productController.getProductByName
);
router.get(
    "/searchByShop", 
    productMiddleware.validateSearchByShopId,
    validateRequest,
    productController.getProductByShop
);
router.get(
    "/searchByCategory",
    productMiddleware.validateSearchByCategoryId,
    validateRequest,
    productController.getProductsByCategory
);
router.get("/actives",
     productController.getProductsActive
);//
router.get("/hiddens", 
    authMiddleware, 
    isSeller, 
    productController.getProductsHidden
);
router.get(
    "/latest",
    productController.getLatestProducts);
router.get(
    "/best-sellers",
    productMiddleware.validateLimit,
    validateRequest,
    productController.getBestSellerProduct
);
router.get(
    "/most-discounted", 
    productMiddleware.validateLimit,
    validateRequest,
    productController.getMostDiscountedProduct
);
router.get(
    "/:id",
    productMiddleware.validateSearchById,
    validateRequest,
    productController.getProductById
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
