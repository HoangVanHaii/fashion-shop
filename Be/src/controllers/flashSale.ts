import { FlashSale, FlashSaleItem } from "../interfaces/flashSale";
import { Request, Response, NextFunction } from "express";
import * as FlashSaleService from "../services/flashSale";
import { AppError } from "../utils/appError";
import redisClient from "../config/redisClient";

export const createFlashSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, startDate, endDate } = req.body;
        const created_by = req.user!.id;
        const flashSale: FlashSale = { title, start_date: startDate, end_date: endDate, created_by };
        const flash_sale_id = await FlashSaleService.createFlashSale(flashSale);
        return res.status(201).json({
            success: true,
            message: 'Flash sale created successfully',
            data: flash_sale_id
        })
    } catch (err) {
        next(err);
    }
}

export const getAllFlashSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string;
        const flashSales = await FlashSaleService.getAllFlashSalesByStatus(status);
        return res.status(200).json({
            success: true,
            message: 'Get all flash sales successfully',
            data: flashSales
        })
    } catch (err) {
        next(err);
    }
}
export const getAllFlashSaleDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string;
        const flashSales = await FlashSaleService.getAllFlashSaleDetails(status)
        return res.status(200).json({
            success: true,
            message: 'Get all flash sales successfully',
            data: flashSales
        })
    } catch (err) {
        next(err);
    }
}
export const getAllFlashSaleForSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string;
        const user_id = req.user!.id;
        const flashSales = await FlashSaleService.getAllFlashSaleForSeller(user_id, status)
        return res.status(200).json({
            success: true,
            message: 'Get all flash sales successfully',
            data: flashSales
        })
    } catch (err) {
        next(err);
    }
}
export const getFlashSaleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const flash_sale_id = parseInt(req.params.id);
        const flashSale = await FlashSaleService.getFlashSaleById(flash_sale_id);
        if (!flashSale) {
            throw new AppError('Flash sale not found', 404, false);
        }
        return res.status(200).json({
            success: true,
            message: 'Get flash sale by id successfully',
            data: flashSale
        })
    } catch (err) {
        next(err);
    }
}
export const getFlashSaleHome = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const cacheKey = `FlashSaleHome`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log("Cache hit FlashSaleHome")
            const data = JSON.parse(cachedData);
            return res.status(200).json({
                success: true,
                message: 'Get flash sale (from cache) successfully',
                ...data
            });
        }
        const { flash_sale, products } = await FlashSaleService.getFlashSaleHome();
        const dataToCache = { flash_sale, products };
        await redisClient.setEx(cacheKey, 600, JSON.stringify(dataToCache));

        return res.status(200).json({
            success: true,
            message: 'Get flash sale by id successfully',
            flash_sale,
            products
        })
    } catch (err) {
        next(err);
    }
}
export const getFlashSaleHotDeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const excludeIdsParam = req.query.excludeIds as string;
        
        const excludeIds: number[]  = excludeIdsParam
            ? excludeIdsParam
                .split(",")
                .map((id: string) => parseInt(id.trim(), 10))
                .filter((num: number) => Number.isFinite(num))
            : [];
        const cacheKey = `FlashSaleDealHotNotId${excludeIds}`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            console.log(`Cache hit FlashSaleDe${cacheKey}`)
            const data = JSON.parse(cachedData);
            return res.status(200).json({
                success: true,
                message: 'Get flash sale (from cache) successfully',
                ...data
            });
        }
        const { flash_sale, products } = await FlashSaleService.getFlashSaleHotDeal(excludeIds);
        const dataToCache = { flash_sale, products };
        await redisClient.setEx(cacheKey, 600, JSON.stringify(dataToCache));

        return res.status(200).json({
            success: true,
            message: 'Get flash sale by id successfully',
            flash_sale,
            products
        })
    } catch (err) {
        next(err)
    }
}
export const getTotalSoldFlashSaleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
  
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Flash sale id is required",
        });
      }
  
      const result = await FlashSaleService.getTotalSoldFlashSaleById(id);
  
      return res.status(200).json({
        success: true,
        message: "Get total sold by flash sale successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
export const updateFlashSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const flash_sale_id = parseInt(req.params.id);
        const { title, startDate, endDate, status } = req.body;
        const created_by = req.user!.id;
        const role = req.user!.role;
        const flashSale: FlashSale = { id: flash_sale_id, title, start_date: startDate, end_date: endDate, status, created_by };

        await FlashSaleService.updateFlashSale(flashSale);
        return res.status(200).json({
            success: true,
            message: 'Update flash sale successfully'
        })
    } catch (err) {
        next(err);
    }
}

export const cancelFlashSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const flash_sale_id = parseInt(req.params.id);
        const user_id = req.user!.id;
        const role = req.user!.role;
        await FlashSaleService.cancelFlashSaleForAdmin(flash_sale_id);
        return res.status(200).json({
            success: true,
            message: 'Cancel flash sale successfully'
        })
    } catch (err) {
        next(err);
    }
}

export const cancelAllFlashSaleItemsBySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const flash_sale_id = parseInt(req.params.id);
        const user_id = req.user!.id;
        await FlashSaleService.cancelAllFlashSaleItemsBySeller(user_id, flash_sale_id);
        return res.status(200).json({
            success: true,
            message: 'Cancel flash sale successfully'
        })
    } catch (err) {
        next(err);
    }
}
export const addFlashSaleItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const flashSaleId = parseInt(req.params.id);
        const { items } = req.body;
        const item: FlashSaleItem[] = items;
        const user_id = req.user!.id;
        const flash_sale_item_id = await FlashSaleService.addItemToFlashSale(user_id, flashSaleId, item);
        return res.status(201).json({
            success: true,
            message: 'Flash sale item added successfully',
            data: flash_sale_item_id
        })
    } catch (err) {
        next(err);
    }
}
export const updateFlashSaleItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const flash_sale_item_id = parseInt(req.params.id);
        const { flash_sale_price, stock } = req.body;
        const user_id = req.user!.id;
        const item: FlashSaleItem = { id: flash_sale_item_id, flash_sale_price, stock };
        await FlashSaleService.updateFlashSaleItem(user_id, item);
        return res.status(200).json({
            success: true,
            message: 'Update flash sale item successfully'
        })
    } catch (err) {
        next(err);
    }
}
export const removeFlashSaleItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const flash_sale_item_id = parseInt(req.params.id);
        const user_id = req.user!.id;
        const role = req.user!.role;
        await FlashSaleService.removeFlashSaleItem(user_id, flash_sale_item_id);
        return res.status(200).json({
            success: true,
            message: 'Remove flash sale item successfully'
        })
    } catch (err) {
        next(err);
    }
}