"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsActive = exports.getFlashSaleHotDeal = exports.getFlashSaleHome = exports.getTotalSoldFlashSaleById = exports.updateFlashSaleItem = exports.updateFlashSale = exports.removeFlashSaleItem = exports.cancelAllFlashSaleItemsForSeller = exports.cancelFlashSaleForAdmin = exports.getAllFlashSalesByStatus = exports.getFlashSaleItemById = exports.getFlashSaleById = exports.getAllFlashSaleForSeller = exports.getAllFlashSaleDetails = exports.addItemToFlashSale = exports.createFlashSale = void 0;
const database_1 = require("../config/database");
const appError_1 = require("../utils/appError");
const mssql_1 = __importDefault(require("mssql"));
const createFlashSale = async (flashSale) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const startDateVN = new Date(new Date(flashSale.start_date).getTime() + 7 * 60 * 60 * 1000);
        const endDateVN = new Date(new Date(flashSale.end_date).getTime() + 7 * 60 * 60 * 1000);
        const result = await pool.request()
            .input("title", flashSale.title)
            .input("user_id", flashSale.created_by)
            .input("start_date", startDateVN)
            .input("end_date", endDateVN)
            .input("status", "pending")
            .query(`INSERT INTO flash_sales (title, created_by, start_date, end_date, status)
                    OUTPUT INSERTED.id AS flash_sale_id
                    VALUES (@title, @user_id, @start_date, @end_date, @status)`);
        return result.recordset[0].flash_sale_id;
    }
    catch (error) {
        console.error(error);
        throw new appError_1.AppError("Failed to create flash sale", 500, false);
    }
};
exports.createFlashSale = createFlashSale;
const addItemToFlashSale = async (user_id, flash_sale_id, items) => {
    const pool = await (0, database_1.connectionDB)();
    const transaction = new mssql_1.default.Transaction(pool);
    try {
        await transaction.begin();
        const checkFlashSale = await new mssql_1.default.Request(transaction)
            .input("flash_sale_id", flash_sale_id)
            .query(`SELECT fs.id, fs.created_by, fs.status, fs.title, u.role
                FROM flash_sales fs
                    JOIN users u ON u.id = fs.created_by
                WHERE fs.id = @flash_sale_id`);
        const flash_sale = checkFlashSale.recordset[0];
        if (!flash_sale) {
            throw new appError_1.AppError("Flash sale not found", 404);
        }
        if (flash_sale.status !== "pending") {
            throw new appError_1.AppError(`Cannot add items while the flash sale is ${flash_sale.status}`, 400);
        }
        for (const item of items) {
            const checkProduct = await new mssql_1.default.Request(transaction)
                .input("product_id", item.product_id)
                .input("user_id", user_id)
                .query(`SELECT p.id 
                    FROM users u
                    JOIN shops s ON u.id = s.seller_id
                    JOIN products p ON s.id = p.shop_id
                    WHERE p.id = @product_id AND u.id = @user_id`);
            if (checkProduct.recordset.length === 0) {
                throw new appError_1.AppError(`Product with ID ${item.product_id} does not belong to your shop`, 404);
            }
            const existingItem = await new mssql_1.default.Request(transaction)
                .input("flash_sale_id", flash_sale_id)
                .input("product_id", item.product_id)
                .query(`SELECT id FROM flash_sale_items 
                        WHERE flash_sale_id = @flash_sale_id AND product_id = @product_id`);
            if (existingItem.recordset.length > 0) {
                throw new appError_1.AppError(`Product with ID ${item.product_id} is already in the flash sale <${checkFlashSale.recordset[0].title}>`, 400);
            }
            const checkConflict = await new mssql_1.default.Request(transaction)
                .input("product_id", item.product_id)
                .input("new_start_date", flash_sale.start_date)
                .input("new_end_date", flash_sale.end_date)
                .input("flash_sale_id", flash_sale_id)
                .query(`
                SELECT fsi.id, fs.title
                FROM flash_sale_items fsi
                JOIN flash_sales fs ON fsi.flash_sale_id = fs.id
                WHERE fsi.product_id = @product_id
                    AND fs.id <> @flash_sale_id
                    AND fs.status IN ('pending','active')
                    AND NOT (
                        fs.end_date < @new_start_date
                        OR fs.start_date > @new_end_date
                    )
                `);
            if (checkConflict.recordset.length > 0) {
                throw new appError_1.AppError(`Product with ID ${item.product_id} is already in another active flash sale during the same period <${checkConflict.recordset[0].title}>`, 400);
            }
            await new mssql_1.default.Request(transaction)
                .input("flash_sale_id", flash_sale_id)
                .input("product_id", item.product_id)
                .input("flash_sale_price", item.flash_sale_price)
                .input("stock", item.stock)
                .query(`INSERT INTO flash_sale_items (flash_sale_id, product_id, flash_sale_price, stock)
                        VALUES (@flash_sale_id, @product_id, @flash_sale_price, @stock)`);
        }
        await transaction.commit();
    }
    catch (err) {
        await transaction.rollback();
        console.error(err);
        if (err instanceof appError_1.AppError)
            throw err;
        throw new appError_1.AppError("Failed to add items to flash sale", 500, false);
    }
};
exports.addItemToFlashSale = addItemToFlashSale;
const getAllFlashSaleDetails = async (status) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("status", status || "active")
            .query(`
                SELECT 
                    fs.id AS flash_sale_id,
                    fs.title,
                    fs.start_date,
                    fs.end_date,
                    fs.status,
                    fs.created_by,
                    fs.created_at,

                    fsi.id AS flash_sale_item_id,
                    fsi.flash_sale_price,
                    fsi.stock,
                    fsi.sold,
                    fsi.status AS flash_sale_item_status,
                    fsi.created_at AS flash_sale_item_created_at,

                    p.id AS product_id,
                    p.name AS product_name,
                    MIN(ps.price) AS original_price,
                    pc.image_url AS product_image
                FROM flash_sales fs
                    LEFT JOIN flash_sale_items fsi ON fs.id = fsi.flash_sale_id
                    LEFT JOIN products p ON fsi.product_id = p.id
                    LEFT JOIN product_colors pc ON p.id = pc.product_id AND pc.is_main = 1
                    LEFT JOIN product_sizes ps ON pc.id = ps.color_id
                WHERE fs.status = @status
                GROUP BY 
                    fs.id, fs.title, fs.start_date, fs.end_date, fs.status, fs.created_by, fs.created_at,
                    fsi.id, fsi.flash_sale_price, fsi.stock, fsi.sold, fsi.status, fsi.created_at,
                    p.id, p.name, pc.image_url
            `);
        const rows = result.recordset;
        const flashSaleMap = new Map();
        rows.forEach(row => {
            if (!flashSaleMap.has(row.flash_sale_id)) {
                flashSaleMap.set(row.flash_sale_id, {
                    id: row.flash_sale_id,
                    title: row.title,
                    start_date: row.start_date,
                    end_date: row.end_date,
                    status: row.status,
                    created_by: row.created_by,
                    created_at: row.created_at,
                    items: []
                });
            }
            if (row.flash_sale_item_id !== null) {
                const item = {
                    id: row.flash_sale_item_id,
                    product_id: row.product_id,
                    product_name: row.product_name,
                    original_price: row.original_price,
                    product_image: row.product_image,
                    flash_sale_price: row.flash_sale_price,
                    stock: row.stock,
                    sold: row.sold,
                    status: row.flash_sale_item_status,
                    created_at: row.flash_sale_item_created_at
                };
                const flashSale = flashSaleMap.get(row.flash_sale_id);
                if (flashSale) {
                    flashSale.items = flashSale.items || [];
                    flashSale.items.push(item);
                }
            }
        });
        return Array.from(flashSaleMap.values());
    }
    catch (err) {
        console.error(err);
        throw new appError_1.AppError("Failed to get flash sales for seller", 500, false);
    }
};
exports.getAllFlashSaleDetails = getAllFlashSaleDetails;
const getAllFlashSaleForSeller = async (user_id, status) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("status", status || "active")
            .input("user_id", user_id)
            .query(`
                SELECT 
                    fs.id AS flash_sale_id,
                    fs.title,
                    fs.start_date,
                    fs.end_date,
                    fs.status,
                    fs.created_by,
                    fs.created_at,

                    fsi.id AS flash_sale_item_id,
                    fsi.flash_sale_price,
                    fsi.stock,
                    fsi.sold,
                    fsi.status AS flash_sale_item_status,
                    fsi.created_at AS flash_sale_item_created_at,

                    p.id AS product_id,
                    p.name AS product_name,
                    MIN(ps.price) AS original_price,
                    pc.image_url AS product_image
                FROM flash_sales fs
                    INNER JOIN flash_sale_items fsi ON fs.id = fsi.flash_sale_id
                    INNER JOIN products p ON fsi.product_id = p.id
                    INNER JOIN product_colors pc ON p.id = pc.product_id AND pc.is_main = 1
                    INNER JOIN product_sizes ps ON pc.id = ps.color_id
                    INNER JOIN shops s ON s.id = p.shop_id
                WHERE fs.status = @status AND s.seller_id = @user_id
                GROUP BY 
                    fs.id, fs.title, fs.start_date, fs.end_date, fs.status, fs.created_by, fs.created_at,
                    fsi.id, fsi.flash_sale_price, fsi.stock, fsi.sold, fsi.status, fsi.created_at,
                    p.id, p.name, pc.image_url
            `);
        const rows = result.recordset;
        const flashSaleMap = new Map();
        rows.forEach(row => {
            if (!flashSaleMap.has(row.flash_sale_id)) {
                flashSaleMap.set(row.flash_sale_id, {
                    id: row.flash_sale_id,
                    title: row.title,
                    start_date: row.start_date,
                    end_date: row.end_date,
                    status: row.status,
                    created_by: row.created_by,
                    created_at: row.created_at,
                    items: []
                });
            }
            if (row.flash_sale_item_id !== null) {
                const item = {
                    id: row.flash_sale_item_id,
                    product_id: row.product_id,
                    product_name: row.product_name,
                    original_price: row.original_price,
                    product_image: row.product_image,
                    flash_sale_price: row.flash_sale_price,
                    stock: row.stock,
                    sold: row.sold,
                    status: row.flash_sale_item_status,
                    created_at: row.flash_sale_item_created_at
                };
                const flashSale = flashSaleMap.get(row.flash_sale_id);
                if (flashSale) {
                    flashSale.items = flashSale.items || [];
                    flashSale.items.push(item);
                }
            }
        });
        return Array.from(flashSaleMap.values());
    }
    catch (err) {
        console.error(err);
        throw new appError_1.AppError("Failed to get flash sales for seller", 500, false);
    }
};
exports.getAllFlashSaleForSeller = getAllFlashSaleForSeller;
const getFlashSaleById = async (id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const checkFlashSale = await pool.request()
            .input("flash_sale_id", id)
            .query(`SELECT id FROM flash_sales WHERE id = @flash_sale_id`);
        if (checkFlashSale.recordset.length === 0) {
            throw new appError_1.AppError("Flash sale not found", 404);
        }
        const result = await pool.request()
            .input("flash_sale_id", id)
            .query(`SELECT 
                        fs.id AS flash_sale_id,
                        fs.title,
                        fs.start_date,
                        fs.end_date,
                        fs.status,
                        fs.created_by,
                        fs.created_at,

                        fsi.id AS flash_sale_item_id,
                        fsi.product_id,
                        fsi.flash_sale_price,
                        fsi.stock,
                        fsi.sold,
                        fsi.status AS flash_sale_item_status,
                        fsi.created_at AS flash_sale_item_created_at,

                        p.name AS product_name,
                        ps.price AS original_price,
                        pc.image_url AS product_image
                    FROM flash_sales fs
                        LEFT JOIN flash_sale_items fsi ON fs.id = fsi.flash_sale_id
                        LEFT JOIN products p ON fsi.product_id = p.id
                        LEFT JOIN product_colors pc ON p.id = pc.product_id AND pc.is_main = 1
                        LEFT JOIN product_sizes ps ON pc.id = ps.color_id
                    WHERE fs.id = @flash_sale_id`);
        const rows = result.recordset;
        if (rows.length === 0)
            return null;
        const itemMap = new Map();
        rows.forEach(row => {
            if (row.flash_sale_item_id !== null && !itemMap.has(row.flash_sale_item_id)) {
                itemMap.set(row.flash_sale_item_id, {
                    id: row.flash_sale_item_id,
                    product_id: row.product_id,
                    product_name: row.product_name,
                    original_price: row.original_price,
                    product_image: row.product_image,
                    flash_sale_price: row.flash_sale_price,
                    stock: row.stock,
                    sold: row.sold,
                    status: row.flash_sale_item_status,
                    created_at: row.flash_sale_item_created_at
                });
            }
        });
        const flashSale = {
            id: rows[0].flash_sale_id,
            title: rows[0].title,
            start_date: rows[0].start_date,
            end_date: rows[0].end_date,
            status: rows[0].status,
            created_by: rows[0].created_by,
            created_at: rows[0].created_at,
            items: Array.from(itemMap.values())
        };
        return flashSale;
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to get flash sale by id", 500, false);
    }
};
exports.getFlashSaleById = getFlashSaleById;
const getFlashSaleItemById = async (id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("id", id)
            .query(`SELECT fsi.id, fs.id AS flash_sale_id, fsi.product_id, pc.image_url,
                 p.name, ps.price as original_price, fsi.flash_sale_price, fsi.stock, fsi.sold, fsi.status, fsi.created_at
                    FROM flash_sale_items fsi
                        JOIN flash_sales fs ON fs.id = fsi.flash_sale_id
                        JOIN products p ON p.id = fsi.product_id
                        JOIN product_colors pc ON pc.product_id = p.id
                        JOIN product_sizes ps ON ps.color_id = ps.id
                    WHERE fsi.id = @id 
                    `);
        if (result.recordset.length === 0) {
            throw new appError_1.AppError("Flash sale item not found", 404);
        }
        const item = result.recordset[0];
        const flash_sale_item = {
            id: item.id,
            flash_sale_id: item.flash_sale_id,
            product_name: item.name,
            product_image: item.image_url,
            original_price: item.original_price,
            flash_sale_price: item.flash_sale_price,
            stock: item.stock,
            sold: item.sold,
            status: item.status,
            created_at: item.created_at
        };
        return flash_sale_item;
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to get flash sale item by id", 500, false);
    }
};
exports.getFlashSaleItemById = getFlashSaleItemById;
const getAllFlashSalesByStatus = async (status, shop_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const request = await pool.request();
        let stringQuery = 'AND status <> \'Cancelled\'';
        if (status) {
            request.input("status", status);
            stringQuery = 'AND status = @status';
        }
        const result = await request
            .query(`
                SELECT id, title, start_date, end_date, status, created_by, created_at
                FROM flash_sales
                WHERE 1 = 1  ${stringQuery}
            `);
        const flashSales = result.recordset;
        const flashSalesWithShopStatus = [];
        for (const sale of flashSales) {
            const checkParticipation = await pool.request()
                .input("flash_sale_id", sale.id)
                .input("shop_id", shop_id)
                .input("status", "removed")
                .query(`
                    SELECT
                        CASE WHEN EXISTS (
                            SELECT 1
                            FROM flash_sale_items AS fsi
                            JOIN product_sizes AS ps ON ps.id = fsi.size_id
                            JOIN product_colors AS pc ON pc.id = ps.color_id
                            JOIN products AS p ON p.id = pc.product_id
                            WHERE
                                fsi.flash_sale_id = @flash_sale_id
                                AND p.shop_id = @shop_id
                                AND fsi.status <> @status
                        ) THEN 1 
                        ELSE 0 
                        END AS ShopParticipated
                `);
            const shopParticipated = checkParticipation.recordset.length > 0 && checkParticipation.recordset[0].ShopParticipated === 1;
            const newSale = {
                ...sale,
                shop_has_sale: shopParticipated
            };
            flashSalesWithShopStatus.push(newSale);
        }
        return flashSalesWithShopStatus.length > 0 ? flashSalesWithShopStatus : null;
    }
    catch (err) {
        console.error(err);
        throw new appError_1.AppError("Failed to get flash sales by status", 500, false);
    }
};
exports.getAllFlashSalesByStatus = getAllFlashSalesByStatus;
const cancelFlashSaleForAdmin = async (id) => {
    const pool = await (0, database_1.connectionDB)();
    const transaction = new mssql_1.default.Transaction(pool);
    try {
        await transaction.begin();
        const checkSale = await new mssql_1.default.Request(transaction)
            .input("flash_sale_id", id)
            .query(`
            SELECT id, created_by, status
            FROM flash_sales
            WHERE id = @flash_sale_id
        `);
        if (checkSale.recordset.length === 0) {
            throw new appError_1.AppError("Flash sale not found", 404);
        }
        const flash_sale = checkSale.recordset[0];
        if (flash_sale.status === "active") {
            throw new appError_1.AppError(`Cannot update while flash sale is active`, 400);
        }
        if (flash_sale.status === "cancelled") {
            throw new appError_1.AppError(`flash sale was cancelled`, 400);
        }
        await new mssql_1.default.Request(transaction)
            .input("flash_sale_id", id)
            .query(`
                UPDATE flash_sales
                SET status = 'cancelled'
                WHERE id = @flash_sale_id
            `);
        await new mssql_1.default.Request(transaction)
            .input("flash_sale_id", id)
            .query(`
                UPDATE flash_sale_items
                SET status = 'removed'
                WHERE flash_sale_id = @flash_sale_id
            `);
        await transaction.commit();
    }
    catch (err) {
        await transaction.rollback();
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to cancel flash sale", 500);
    }
};
exports.cancelFlashSaleForAdmin = cancelFlashSaleForAdmin;
const cancelAllFlashSaleItemsForSeller = async (shop_id, id) => {
    const pool = await (0, database_1.connectionDB)();
    const transaction = new mssql_1.default.Transaction(pool);
    try {
        await transaction.begin();
        const checkSale = await new mssql_1.default.Request(transaction)
            .input("flash_sale_id", id)
            .query(`
                SELECT id, status
                FROM flash_sales
                WHERE id = @flash_sale_id
        `);
        if (checkSale.recordset.length === 0) {
            throw new appError_1.AppError("Flash sale not found", 404);
        }
        const flash_sale = checkSale.recordset[0];
        if (flash_sale.status === "cancelled") {
            throw new appError_1.AppError(`flash sale was cancelled`, 400);
        }
        if (flash_sale.status === "ended") {
            throw new appError_1.AppError(`flash sale was ended`, 400);
        }
        await new mssql_1.default.Request(transaction)
            .input("flash_sale_id", id)
            .input("shop_id", shop_id)
            .query(`
                UPDATE fsi
                SET status = 'removed'
                FROM flash_sale_items fsi
                    JOIN product_sizes ps ON ps.id = fsi.size_id
                    JOIN product_colors pc ON pc.id = ps.color_id
                    JOIN products p ON p.id = pc.product_id
                WHERE fsi.flash_sale_id = @flash_sale_id AND p.shop_id = @shop_id
            `);
        await transaction.commit();
        console.log(11111111111111111111111111111);
    }
    catch (err) {
        await transaction.rollback();
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to cancel flash sale", 500, false);
    }
};
exports.cancelAllFlashSaleItemsForSeller = cancelAllFlashSaleItemsForSeller;
const removeFlashSaleItem = async (user_id, flash_sale_item_id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const checkItem = await pool.request()
            .input("flash_sale_item_id", flash_sale_item_id)
            .input("user_id", user_id)
            .query(`SELECT fs.id
                    FROM flash_sale_items fsi
                        JOIN products p ON p.id = fsi.product_id
                        JOIN shops s ON s.id = p.shop_id
                        JOIN flash_sales fs ON fsi.flash_sale_id = fs.id
                        WHERE fsi.id = @flash_sale_item_id AND s.seller_id = @user_id
                        `);
        if (checkItem.recordset.length === 0) {
            throw new appError_1.AppError("Flash sale item not found or not belongs to seller", 404);
        }
        const result = await pool.request()
            .input("flash_sale_item_id", flash_sale_item_id)
            .query(`UPDATE flash_sale_items
                    SET status = 'removed'
                    WHERE id = @flash_sale_item_id`);
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to remove flash sale item", 500, false);
    }
};
exports.removeFlashSaleItem = removeFlashSaleItem;
const updateFlashSale = async (flashSale) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("flash_sale_id", flashSale.id)
            .query(`
                SELECT id, created_by, start_date, end_date, status
                FROM flash_sales 
                WHERE id = @flash_sale_id
            `);
        if (result.recordset.length === 0) {
            throw new appError_1.AppError("Flash sale not found", 404);
        }
        const existingSale = result.recordset[0];
        if (existingSale.status === "active") {
            throw new appError_1.AppError("Cannot update flash sale while it is running", 400);
        }
        const allowedFields = ["title", "start_date", "end_date", "status"];
        const request = pool.request();
        request.input("flash_sale_id", flashSale.id);
        const setList = [];
        Object.entries(flashSale).forEach(([key, value]) => {
            if (allowedFields.includes(key) && value != null && value !== "") {
                if (key === "start_date" || key === "end_date") {
                    const vnTime = new Date(new Date(value).getTime() + 7 * 60 * 60 * 1000);
                    setList.push(`${key} = @${key}`);
                    request.input(key, vnTime);
                }
                else {
                    setList.push(`${key} = @${key}`);
                    request.input(key, value);
                }
            }
        });
        if (setList.length === 0) {
            throw new appError_1.AppError("No valid fields to update", 400);
        }
        await request.query(`
            UPDATE flash_sales
            SET ${setList.join(", ")}
            WHERE id = @flash_sale_id
        `);
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to update flash sale", 500, false);
    }
};
exports.updateFlashSale = updateFlashSale;
const updateFlashSaleItem = async (user_id, item) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const checkItem = await pool.request()
            .input("flash_sale_item_id", item.id)
            .query(`
                SELECT fsi.id, s.seller_id, fs.status
                FROM flash_sale_items fsi
                JOIN products p ON p.id = fsi.product_id
                JOIN shops s ON s.id = p.shop_id
                INNER JOIN flash_sales fs ON fsi.flash_sale_id = fs.id
                WHERE fsi.id = @flash_sale_item_id
            `);
        if (checkItem.recordset.length === 0) {
            throw new appError_1.AppError("Flash sale item not found", 404);
        }
        const { seller_id, status } = checkItem.recordset[0];
        if (seller_id !== user_id) {
            throw new appError_1.AppError("You are not allowed to update this flash sale item", 403);
        }
        if (status !== "pending") {
            throw new appError_1.AppError("Flash sale is not pending, cannot update items", 400);
        }
        const allowedFields = ["flash_sale_price", "stock", "status"];
        const request = pool.request();
        request.input("flash_sale_item_id", item.id);
        const setList = [];
        Object.entries(item).forEach(([key, value]) => {
            if (allowedFields.includes(key) && value != null && value !== "") {
                setList.push(`${key} = @${key}`);
                request.input(key, value);
            }
        });
        if (setList.length === 0) {
            throw new appError_1.AppError("No valid fields to update", 400);
        }
        await request.query(`
            UPDATE flash_sale_items
            SET ${setList.join(", ")}
            WHERE id = @flash_sale_item_id
        `);
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to update flash sale item", 500);
    }
};
exports.updateFlashSaleItem = updateFlashSaleItem;
const getTotalSoldFlashSaleById = async (id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("flash_sale_id", id)
            .query(`
                SELECT 
                    p.id AS product_id,
                    SUM(fsi.sold) AS total_flash_sale_sold
                FROM products p
                INNER JOIN product_colors pc ON pc.product_id = p.id
                INNER JOIN product_sizes ps ON ps.color_id = pc.id
                INNER JOIN flash_sale_items fsi ON fsi.size_id = ps.id AND fsi.status = 'active'
                INNER JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active'
                WHERE fs.id = @flash_sale_id
                GROUP BY p.id;

            `);
        return result.recordset;
    }
    catch (err) {
        if (err instanceof appError_1.AppError)
            throw err;
        console.error(err);
        throw new appError_1.AppError("Failed to update flash sale item", 500);
    }
};
exports.getTotalSoldFlashSaleById = getTotalSoldFlashSaleById;
const getFlashSaleHome = async () => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const flashSaleResult = await pool.request().query(`
            SELECT TOP 1 fs.*
            FROM flash_sales fs
            WHERE fs.status = 'active'
              AND (
                  SELECT COUNT(*)
                  FROM flash_sale_items fsi
                  WHERE fsi.flash_sale_id = fs.id
                    AND fsi.status = 'active'
              ) >= 4
            ORDER BY fs.start_date DESC
        `);
        const flash_sale = flashSaleResult.recordset[0];
        const products = await (0, exports.getProductsActive)(flash_sale.id);
        return { flash_sale, products };
    }
    catch (err) {
        console.error("Error getFlashSaleHome:", err);
        throw new appError_1.AppError("Failed to get flash sale Home", 500, false);
    }
};
exports.getFlashSaleHome = getFlashSaleHome;
const getFlashSaleHotDeal = async (excludeIds = []) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const request = pool.request();
        let notInClause = "";
        if (excludeIds.length > 0) {
            const params = excludeIds.map((_, i) => `@id${i}`).join(",");
            notInClause = `AND fs.id NOT IN (${params})`;
            excludeIds.forEach((id, i) => {
                request.input(`id${i}`, id);
            });
        }
        const query = `
            SELECT TOP 1 fs.*
            FROM flash_sales fs
            WHERE fs.status = 'active'
              AND (
                  SELECT COUNT(*)
                  FROM flash_sale_items fsi
                  WHERE fsi.flash_sale_id = fs.id
                    AND fsi.status = 'active'
              ) >= 4
              ${notInClause}
            ORDER BY fs.start_date DESC;
        `;
        const flashSaleResult = await request.query(query);
        const flash_sale = flashSaleResult.recordset[0];
        if (!flash_sale) {
            return {
                flash_sale: {},
                products: [],
            };
        }
        const products = await (0, exports.getProductsActive)(flash_sale.id);
        return { flash_sale, products };
    }
    catch (err) {
        console.error("Error getHotDeal:", err);
        throw new appError_1.AppError("Failed to get hot deal", 500, false);
    }
};
exports.getFlashSaleHotDeal = getFlashSaleHotDeal;
const getProductsActive = async (flash_sale_id) => {
    try {
        const query = `${baseQuery}
            HAVING p.status = 'active'
            ORDER BY fsi.flash_sale_price DESC `;
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("flash_sale_id", flash_sale_id)
            .query(query);
        const records = result.recordset;
        const productMap = new Map();
        for (const row of records) {
            const { id, name, shop_id, description, category_name, image_url, min_price, max_price, sold_quantity, flash_sale_price, avg_rating } = row;
            if (!productMap.has(id)) {
                productMap.set(id, {
                    id,
                    name,
                    shop_id,
                    description,
                    category_name,
                    min_price,
                    max_price,
                    sold_quantity,
                    avg_rating: avg_rating ?? 0,
                    flash_price: flash_sale_price ?? null,
                    images: [],
                    thumbnail: image_url
                });
            }
            else {
                const product = productMap.get(id);
                product.sold_quantity += sold_quantity ?? 0;
            }
            const product = productMap.get(id);
            if (image_url && !product.images.includes(image_url)) {
                product.images.push(image_url);
            }
        }
        return Array.from(productMap.values());
    }
    catch (error) {
        console.error(error);
        throw new appError_1.AppError('Failed to fetch active products', 500, false);
    }
};
exports.getProductsActive = getProductsActive;
const baseQuery = `
                SELECT  
                p.id,
                fsi.id AS flash_sale_item_id,
                p.name,
                p.description,
                p.status,
                i.image_url,
                MIN(fsi.flash_sale_price) AS flash_sale_price,
                MIN(s.price) AS min_price,   
                MAX(s.price) AS max_price,
                fsi.stock AS sold_quantity
            FROM products p
            INNER JOIN categories c ON p.category_id = c.category_id
            INNER JOIN product_colors i ON i.product_id = p.id
            INNER JOIN product_sizes s ON s.color_id = i.id
            LEFT JOIN flash_sale_items fsi ON fsi.size_id = s.id AND fsi.status = 'active'
            LEFT JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active' 
            WHERE fs.id = @flash_sale_id
            GROUP BY 
                p.id, fsi.id, p.name, p.description, p.status, i.image_url, fsi.flash_sale_price, fsi.stock
            `;
