import express from "express";
import *as productController from "../controllers/product";
import *as productMiddleware from "../middlewares/validateInput";
const router = express.Router();

router.get("/", productController.getProducts);
router.get("/searchByName", productController.getProductByName);
router.get("/searchByShop", productController.getProductByShop);
router.get("/searchByCategory", productController.getProductsByCategory);
router.get("/actives", productController.getProductsActive);
router.get("/latest", productController.getLatestProducts);
router.get("/best-sellers", productController.getBestSellerProduct);
router.get("/most-discounted", productController.getMostDiscountedProduct);
router.get("/:id", productController.getProductById);
router.post("/addProduct",productMiddleware.addProduct ,productController.addProduct);
router.put("/updateProduct",productMiddleware.updateProduct ,productController.updateProduct);
router.delete("/deleteProduct",productMiddleware.softDeleteProduct ,productController.softDeleteProduct);

export default router;
