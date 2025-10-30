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
const reviewController = __importStar(require("../controllers/review"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const reviewValidator = __importStar(require("../middlewares/validateReview"));
const uploadReview_1 = require("../utils/uploadReview");
const router = (0, express_1.default)();
router.post('/', authMiddleware_1.authMiddleware, uploadReview_1.uploadReview, reviewValidator.createReviewValidator, validateRequest_1.validateRequest, reviewController.createReview);
router.get('/product/:product_id', reviewValidator.product_idValidator, reviewController.getReviewsByProductId);
router.get('/:review_id', reviewValidator.review_idValidator, authMiddleware_1.authMiddleware, reviewController.getReviewById);
router.delete('/:review_id', reviewValidator.review_idValidator, authMiddleware_1.authMiddleware, validateRequest_1.validateRequest, reviewController.removeReviewById);
router.put('/:review_id', authMiddleware_1.authMiddleware, uploadReview_1.uploadReview, reviewValidator.updateReviewValidator, validateRequest_1.validateRequest, reviewController.updateReview);
exports.default = router;
