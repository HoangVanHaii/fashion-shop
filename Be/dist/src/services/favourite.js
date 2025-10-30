"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavouritesByUserId = exports.deleteFavourite = exports.createFavourite = void 0;
const appError_1 = require("../utils/appError");
const database_1 = require("../config/database");
const createFavourite = async (favourite) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `INSERT INTO favourites (user_id, product_id, created_at)
                       VALUES (@user_id, @product_id, @created_at)`;
        await pool.request()
            .input("user_id", favourite.user_id)
            .input("product_id", favourite.product_id)
            .input("created_at", favourite.created_at || new Date())
            .query(query);
    }
    catch (error) {
        throw new appError_1.AppError('Failed to create favourite', 500, false);
    }
};
exports.createFavourite = createFavourite;
const deleteFavourite = async (user_id, product_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `DELETE FROM favourites WHERE user_id = @user_id AND product_id = @product_id`;
        await pool.request()
            .input("user_id", user_id)
            .input("product_id", product_id)
            .query(query);
    }
    catch (error) {
        throw new appError_1.AppError('Failed to delete favourite', 500, false);
    }
};
exports.deleteFavourite = deleteFavourite;
const getFavouritesByUserId = async (user_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const sql = `
            SELECT
                s.id AS shop_id,
                s.name AS shop_name,
                p.id AS product_id,
                p.name AS product_name,
                pc.image_url AS image_url,
                pc.color AS color,
                (SELECT TOP 1 ps.size
                 FROM product_sizes ps 
                 WHERE ps.color_id = pc.id) AS size,
                MIN(ps.price) AS price,
                MIN(fsi.flash_sale_price) AS flash_price,
                f.created_at
            FROM favourites f
            INNER JOIN products p ON p.id = f.product_id
            INNER JOIN shops s ON s.id = p.shop_id
            INNER JOIN product_colors pc ON p.id = pc.product_id AND pc.is_main = 1
            INNER JOIN product_sizes ps ON ps.color_id = pc.id
            LEFT JOIN flash_sale_items fsi ON fsi.size_id = ps.id
            WHERE f.user_id = @user_id
            GROUP BY
                s.id, s.name, p.id, p.name, pc.image_url, pc.color, f.created_at, pc.id
            ORDER BY s.id, p.id`;
        const result = await pool.request()
            .input("user_id", user_id)
            .query(sql);
        const rows = result.recordset || [];
        const map = new Map();
        for (const r of rows) {
            const shopId = r.shop_id;
            const item = {
                product_id: r.product_id,
                product_name: r.product_name,
                image_url: r.image_url,
                price: r.price,
                flash_price: r.flash_price,
                color: r.color,
                size: r.size
            };
            if (!map.has(shopId)) {
                map.set(shopId, {
                    user_id: user_id,
                    shop_id: shopId,
                    shop_name: r.shop_name,
                    products: [item]
                });
            }
            else {
                const shop = map.get(shopId);
                const exists = shop.products.some(p => p.product_id === r.product_id);
                if (!exists)
                    shop.products.push(item);
            }
        }
        return Array.from(map.values());
    }
    catch (error) {
        console.error(error);
        throw new appError_1.AppError('Failed to fetch favourites', 500, false);
    }
};
exports.getFavouritesByUserId = getFavouritesByUserId;
// }
//     throw new AppError('Failed to fetch favourites', 500, false);
// }
