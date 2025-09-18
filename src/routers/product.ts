import express from "express";
import *as productController from "../controllers/product";
import *as productMiddleware from "../middlewares/validateProduct";
import { validateRequest } from "../middlewares/validateRequest";
const router = express.Router();

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

export default router;
