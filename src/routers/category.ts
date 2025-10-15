// routes/category.routes.ts
import { Router } from "express";
import * as categoryController from "../controllers/category";
import * as categoriesValidator  from "../middlewares/validateCategory"
import { validateRequest } from "../middlewares/validateRequest";
import { authMiddleware } from "../middlewares/authMiddleware";
const router = Router();


router.get("/active",authMiddleware,categoryController.getAllActiveCategories);
router.get("/inactive",authMiddleware,categoryController.getAllInactiveCategories);
router.get('/categoryName', categoryController.getCategoryNameByGender);
router.get("/:id",authMiddleware,categoriesValidator.categoryByIdValidator,validateRequest,categoryController.getCategoryById);


export default router;
