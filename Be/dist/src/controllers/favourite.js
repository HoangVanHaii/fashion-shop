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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFavourite = exports.getFavouritesOfme = exports.createFavourite = void 0;
const favouriteService = __importStar(require("../services/favourite"));
const createFavourite = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const { product_id } = req.body;
        const favouriteData = {
            user_id: user_id,
            product_id: product_id
        };
        await favouriteService.createFavourite(favouriteData);
        res.status(201).json({ message: 'Product added to favourites' });
    }
    catch (error) {
        next(error);
    }
};
exports.createFavourite = createFavourite;
const getFavouritesOfme = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const favourites = await favouriteService.getFavouritesByUserId(user_id);
        res.status(200).json(favourites);
    }
    catch (error) {
        next(error);
    }
};
exports.getFavouritesOfme = getFavouritesOfme;
const deleteFavourite = async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const product_id = parseInt(req.params.product_id);
        await favouriteService.deleteFavourite(user_id, product_id);
        res.status(200).json({ message: 'Product removed from favourites' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFavourite = deleteFavourite;
