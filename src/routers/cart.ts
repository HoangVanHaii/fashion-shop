import {Router} from "express";
import * as cartController from "../controllers/cart";
import * as cartValidator from "../middlewares/validateCart";
import { validateRequest } from "../middlewares/validateRequest";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post('/addToCart', cartValidator.addToCartValidator, validateRequest, authMiddleware, cartController.addtoCart);
router.get('/', authMiddleware, cartController.getCartItems);
router.put('/updateItemQuantity/:id', cartValidator.updateCartItemQuantityValidator, validateRequest, authMiddleware, cartController.updateCartItemQuantity);
router.put('/updateItem/:id', cartValidator.updateCartItemValidator, validateRequest, authMiddleware, cartController.updateCartItem);
router.delete('/removeItem/:id', authMiddleware, cartController.removeCartItem);
router.delete('/clearCart', authMiddleware, cartController.clearCart);
export default router;