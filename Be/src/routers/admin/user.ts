import express from 'express';
import * as userController from '../../controllers/admin/user';
import { authMiddleware, isAdmin } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validateRequest';
import * as userValidator from '../../middlewares/validateUser';
const router = express.Router();

router.post("/createUser", authMiddleware, isAdmin, userValidator.createUserByAdminValidator, validateRequest, userController.createUserByAdmin);
router.get("/", authMiddleware, isAdmin, userController.getAllUsers);
router.get("/search", authMiddleware, isAdmin, userController.searchUsers);
router.get("/:id", userValidator.idValidator, validateRequest, userController.getUserById);
router.put('/unlock/:id', authMiddleware, isAdmin, userValidator.idValidator, validateRequest, userController.unlockUser);
router.put('/:id', authMiddleware, isAdmin, userValidator.updateUserByAdminValidator, validateRequest, validateRequest, userController.updateUserByAdmin)
router.delete('/:id', userValidator.idValidator, validateRequest, authMiddleware, isAdmin, userController.deleteUser);
router.put("/respondSellerRequest/:id", authMiddleware, isAdmin, userController.respondSellerRequest);
export default router;