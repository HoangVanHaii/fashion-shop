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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flashSaleController = __importStar(require("../controllers/flashSale"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const flashSaleValidate = __importStar(require("../middlewares/validateFLashSale"));
const validateRequest_1 = require("../middlewares/validateRequest");
const router = (0, express_1.Router)();
router.get("/newFlashSale", flashSaleController.getFlashSaleHome);
router.get("/activeNotIn", flashSaleController.getFlashSaleHotDeal);
router.get("/totalSold/:id", flashSaleController.getTotalSoldFlashSaleById);
router.post("/", authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, flashSaleValidate.validateCreateFlashSale, validateRequest_1.validateRequest, flashSaleController.createFlashSale);
router.post("/item/:id", authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, flashSaleValidate.validateAddFlashSaleItem, validateRequest_1.validateRequest, flashSaleController.addFlashSaleItem);
router.get("/detail", authMiddleware_1.authMiddleware, flashSaleController.getAllFlashSaleDetails);
router.get("/seller", authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, flashSaleController.getAllFlashSaleForSeller);
router.get("/", authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, flashSaleController.getAllFlashSales);
router.get("/:id", flashSaleValidate.validateId, validateRequest_1.validateRequest, flashSaleController.getFlashSaleById);
router.put("/item/:id", authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, flashSaleValidate.validateUpdateFlashSaleItem, validateRequest_1.validateRequest, flashSaleController.updateFlashSaleItem);
router.put("/:id", authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, flashSaleValidate.validateUpdateFlashSale, validateRequest_1.validateRequest, flashSaleController.updateFlashSales);
router.delete("/:id", authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, flashSaleValidate.validateId, validateRequest_1.validateRequest, flashSaleController.cancelFlashSale);
router.delete("/allFlashItem/:id", authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, flashSaleValidate.validateId, validateRequest_1.validateRequest, flashSaleController.cancelAllFlashSaleItemsForSeller);
router.delete("/item/:id", authMiddleware_1.authMiddleware, authMiddleware_1.isSeller, flashSaleValidate.validateId, validateRequest_1.validateRequest, flashSaleController.removeFlashSaleItem);
exports.default = router;
