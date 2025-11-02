import express from "express";
import *as productController from "../../controllers/seller/product";
import *as productMiddleware from "../../middlewares/validateProduct";
import { validateRequest } from "../../middlewares/validateRequest";
import { uploadProductImages, upload } from "../../utils/uploadProduct"
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
    // uploadProductImages,
    // upload.none(),
    // productMiddleware.AddProduct, 
    // validateRequest,
    productController.addProduct,
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
router.post("/product-image", uploadProductImages, async (req, res) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const urls = files.map(f => `/uploads/products/${f.filename}`);

        return res.status(200).json({
            message: "Upload successful",
            urls
        });
    } catch (error) {
        console.log("Error uploading product image:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});


export default router;