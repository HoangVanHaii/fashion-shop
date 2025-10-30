import Router from 'express';
import * as reviewController from '../controllers/review';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import * as reviewValidator from '../middlewares/validateReview';
import { uploadReview } from '../utils/uploadReview';

const router = Router();
router.post('/', authMiddleware, uploadReview, reviewValidator.createReviewValidator, validateRequest, reviewController.createReview);
router.get('/product/:product_id', reviewValidator.product_idValidator, reviewController.getReviewsByProductId);
router.get('/:review_id', reviewValidator.review_idValidator , authMiddleware, reviewController.getReviewById);
router.get('/review_of_me/:order_id',reviewValidator.review_order_idValidator,authMiddleware,validateRequest,reviewController.getReviewsByOrderItemIdOfMe);
router.delete('/:review_id', reviewValidator.review_idValidator, authMiddleware, validateRequest, reviewController.removeReviewById);
router.put('/:review_id',authMiddleware, uploadReview, reviewValidator.updateReviewValidator, validateRequest, reviewController.updateReview);

export default router