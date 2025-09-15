import express from 'express';
import * as orderController from '../controllers/order'
import { validateCreateOrder } from '../middlewares/validateOrder';
import { validateRequest } from '../middlewares/validateRequest';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();

router.post(
    '/createOrder', 
    authMiddleware,
    validateCreateOrder,
    validateRequest,
    orderController.createOrder
);

export default router;