import express from 'express';
import * as orderController from '../controllers/order'
import { validateCreateOrder } from '../middlewares/validateOrder';
import { validateRequest } from '../middlewares/validateRequest';
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();

router.get(
    '/getOrderOfme',
    authMiddleware,
    orderController.getOrderOfme
)
router.get(
    '/:id',
    authMiddleware,
    orderController.getOrderById
)
router.post(
    '/createOrder', 
    authMiddleware,
    validateCreateOrder,
    validateRequest,
    orderController.createOrder
);
router.put(
    '/updateShippingAddress',
    authMiddleware,
    orderController.updateAdressOrder
)
router.put(
    '/cancelOrderByUser',
    authMiddleware,
    orderController.cancelOrderByUser
)

export default router;