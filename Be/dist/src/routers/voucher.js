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
const voucherController = __importStar(require("../controllers/voucher"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const uploadVoucher_1 = require("../utils/uploadVoucher");
const voucherValidate = __importStar(require("../middlewares/voucher"));
const router = express_1.default.Router();
router.get('/topVoucher', voucherController.getTopVouchers);
router.get('/', voucherController.getAllVouchers);
router.get('/getVoucherByCode/:code', voucherController.getVoucherByCode);
router.get('/getVoucherByShopId', voucherController.getVoucherByShopId);
router.get('/:id', voucherController.getVoucherByShopIdForUser);
router.get('/getVoucherCodeById/:id', voucherController.getVoucherCodeById);
router.get('/getVoucherById/:id', voucherController.getVoucherById);
router.post('/createVoucher', authMiddleware_1.authMiddleware, authMiddleware_1.adminOrSeller, uploadVoucher_1.uploadVoucherImage, voucherValidate.createVoucherData, validateRequest_1.validateRequest, voucherController.createVoucher);
router.put('/updateVoucher/:id', authMiddleware_1.authMiddleware, voucherValidate.updateVoucherData, validateRequest_1.validateRequest, authMiddleware_1.adminOrSeller, voucherController.updateVoucher);
exports.default = router;
