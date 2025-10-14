// routes/category.routes.ts
import { Router } from "express";
import * as categoryController from "../controllers/categories";
import * as categoriesValidator  from "../middlewares/validateCategories"
import { validateRequest } from "../middlewares/validateRequest";
import { authMiddleware } from "../middlewares/authMiddleware";
const router = Router();

router.post("/",authMiddleware,categoriesValidator.addCategoryValidator,validateRequest,categoryController.addCategory);
router.get("/active",authMiddleware,categoryController.getAllActiveCategories);
router.get("/inactive",authMiddleware,categoryController.getAllInactiveCategories);
router.get("/:id",authMiddleware,categoriesValidator.CategoriesByIdValidator,validateRequest,categoryController.getCategoryById);
router.put("/:id",authMiddleware,categoriesValidator.CategoriesByIdValidator,categoriesValidator.updateCategoryValidator,validateRequest,categoryController.updateCategory);
router.delete("/:id",authMiddleware,categoriesValidator.CategoriesByIdValidator,validateRequest,categoryController.deleteCategory);

export default router;
