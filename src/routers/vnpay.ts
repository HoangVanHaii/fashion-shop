import { Router } from 'express';
import { createPaymentQR, checkPayment } from '../controllers/vnpay';

const router = Router();

router.post('/create-qr', createPaymentQR);
router.get('/check-payment-vnpay', checkPayment);

export default router;
