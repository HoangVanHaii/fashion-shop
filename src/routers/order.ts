import express from 'express';
import * as orderController from '../controllers/order'
import { authMiddleware } from '../middlewares/authMiddleware';
const router = express.Router();

router.post('/createOrder', authMiddleware,orderController.createOrder);

export default router;