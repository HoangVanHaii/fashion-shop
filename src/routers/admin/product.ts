import express from "express";
import *as productController from "../../controllers/admin/product";
import { isAdmin, authMiddleware } from "../../middlewares/authMiddleware";
const router = express.Router();

router.get(
    "/",
    authMiddleware,
    isAdmin,
    productController.getAllProducts
);
router.get(
    "/hidden", 
    authMiddleware, 
    isAdmin, 
    productController.getAllProductsHidden
);

export default router;