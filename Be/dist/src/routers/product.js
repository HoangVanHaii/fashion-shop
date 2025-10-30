"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController = __importStar(require("../controllers/product"));
const productMiddleware = __importStar(require("../middlewares/validateProduct"));
const validateRequest_1 = require("../middlewares/validateRequest");
const router = express_1.default.Router();
router.get("/searchByName", productMiddleware.validateSearchByName, validateRequest_1.validateRequest, productController.getProductByName);
router.get("/searchByShop", productMiddleware.validateSearchByShopId, validateRequest_1.validateRequest, productController.getProductByShop);
router.get('/searchByCategoryGender', productController.getProductByCategoryGender);
router.get("/searchByCategory", productController.getProductsByCategory);
router.get("/actives", productController.getProductsActive);
router.get("/latest", productController.getLatestProducts);
router.get("/best-sellers", productMiddleware.validateLimit, validateRequest_1.validateRequest, productController.getBestSellerProduct);
router.get("/most-discounted", productMiddleware.validateLimit, validateRequest_1.validateRequest, productController.getMostDiscountedProduct);
router.get("/:id", productMiddleware.validateSearchById, validateRequest_1.validateRequest, productController.getProductById);
router.get("/id-by-size/:id", productMiddleware.validateSearchById, validateRequest_1.validateRequest, productController.getProductIdBySize);
router.get("/size-detail/:id", productMiddleware.validateSearchById, validateRequest_1.validateRequest, productController.getProductSizesBySize);
exports.default = router;
