import { Router } from "express";
import * as categoryController from "../../controllers/admin/category";
import * as categoriesValidator  from "../../middlewares/validateCategory"
import { validateRequest } from "../../middlewares/validateRequest";
import { authMiddleware } from "../../middlewares/authMiddleware";
const router = Router();

router.post("/",authMiddleware,categoriesValidator.addCategoryValidator,validateRequest,categoryController.addCategory);
router.put("/:id",authMiddleware,categoriesValidator.categoryByIdValidator,categoriesValidator.updateCategoryValidator,validateRequest,categoryController.updateCategory);
router.delete("/:id",authMiddleware,categoriesValidator.categoryByIdValidator,validateRequest,categoryController.deleteCategory);

export default router;
