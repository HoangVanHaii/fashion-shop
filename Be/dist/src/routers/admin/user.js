"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("../../controllers/admin/user"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const validateRequest_1 = require("../../middlewares/validateRequest");
const userValidator = __importStar(require("../../middlewares/validateUser"));
const router = express_1.default.Router();
router.post("/createUser", authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, userValidator.createUserByAdminValidator, validateRequest_1.validateRequest, userController.createUserByAdmin);
router.get("/", authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, userController.getAllUsers);
router.get("/search", authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, userController.searchUsers);
router.get("/:id", userValidator.idValidator, validateRequest_1.validateRequest, userController.getUserById);
router.put('/unlock/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, userValidator.idValidator, validateRequest_1.validateRequest, userController.unlockUser);
router.put('/:id', authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, userValidator.updateUserByAdminValidator, validateRequest_1.validateRequest, validateRequest_1.validateRequest, userController.updateUserByAdmin);
router.delete('/:id', userValidator.idValidator, validateRequest_1.validateRequest, authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, userController.deleteUser);
router.put("/respondSellerRequest/:id", authMiddleware_1.authMiddleware, authMiddleware_1.isAdmin, userController.respondSellerRequest);
exports.default = router;
