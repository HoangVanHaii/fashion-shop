import express from 'express';
import *as voucherController from '../controllers/voucher'
import { authMiddleware, adminOrSeller } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { uploadVoucherImage } from '../utils/uploadVoucher';
import *as voucherValidate from '../middlewares/voucher';

const router = express.Router();

router.get('/', voucherController.getAllVouchers);
router.get('/getVoucherByCode/:code', voucherController.getVoucherByCode);
router.get('/getVoucherByShopId', voucherController.getVoucherByShopId);
router.get('/getVoucherCodeById/:id', voucherController.getVoucherCodeById);
router.get('/getVoucherById/:id', voucherController.getVoucherById);
router.get('/topVoucher', voucherController.getTopVouchers);


router.post(
    '/createVoucher',
    authMiddleware,
    adminOrSeller,
    uploadVoucherImage,
    voucherValidate.createVoucherData,
    validateRequest,
    voucherController.createVoucher
);
router.put(
    '/updateVoucher/:id',
    authMiddleware,
    voucherValidate.updateVoucherData,
    validateRequest,
    adminOrSeller,
    voucherController.updateVoucher
);
export default router;