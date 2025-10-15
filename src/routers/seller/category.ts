import { Router } from "express";
import * as categoryController from "../../controllers/seller/category";
import * as categoriesValidator  from "../../middlewares/validateCategory"
import { validateRequest } from "../../middlewares/validateRequest";
import { authMiddleware } from "../../middlewares/authMiddleware";
const router = Router();

router.post("/",authMiddleware,categoriesValidator.addCategoryValidator,validateRequest,categoryController.addCategorySeller);

export default router;
