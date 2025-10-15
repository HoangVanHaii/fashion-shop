import *as orderController from '../../controllers/seller/order'
import { authMiddleware } from '../../middlewares/authMiddleware';
import { isSeller } from '../../middlewares/authMiddleware';
import express from 'express'

const router = express.Router();
router.get(
    '/getOrderOfShopMe',
    authMiddleware,
    isSeller,
    orderController.getOderOfShopMe
)
router.put(
    '/confirm',
    authMiddleware,
    isSeller,
    orderController.confirmOrder
)
router.put(
    '/dispatch',
    authMiddleware,
    isSeller,
    orderController.dispatchOrder
)
router.put(
    '/complete',
    authMiddleware,
    isSeller,
    orderController.completeOrder
)
router.put(
    '/cancel',
    authMiddleware,
    isSeller,
    orderController.cancelOrder
)
export default router;