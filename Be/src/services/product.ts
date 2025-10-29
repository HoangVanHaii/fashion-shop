import { ProductPayload, ProductSize, ProductColor, ProductSummary } from '../interfaces/product';
import { connectionDB } from '../config/database';
import { AppError } from '../utils/appError';
import mssql from 'mssql';
const baseQuery = `
                SELECT  
                p.id,
                p.name,
                p.description,
                p.shop_id,
                c.category_name,
                c.gender,
                sp.id AS shop_id,
                p.status,
                i.image_url,
                fsi.flash_sale_price,
                MIN(s.price) AS min_price,   
                MAX(s.price) AS max_price,
                ISNULL(SUM(oi.quantity), 0) AS sold_quantity
            FROM products p
            INNER JOIN categories c ON p.category_id = c.category_id
            INNER JOIN product_colors i ON i.product_id = p.id
            INNER JOIN product_sizes s ON s.color_id = i.id
            INNER JOIN shops sp ON p.shop_id = sp.id
            LEFT JOIN flash_sale_items fsi ON fsi.size_id = s.id AND fsi.status = 'active'
            LEFT JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active' 
            LEFT JOIN order_items oi ON oi.size_id = s.id
            GROUP BY 
                p.id, p.name, p.description, p.shop_id, c.category_name, c.gender, sp.id, p.status, i.image_url, fsi.flash_sale_price  `;

export const getAllProducts = async (): Promise<ProductSummary[]> => {
    try {
        const pool = await connectionDB();
        const query = baseQuery
        const result = await pool.request().query(query);
        return result.recordset as ProductSummary[];
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to fetch products', 500, false);
    }
}
export const getProductSizesBySizeId = async (size_id: number): Promise<any> => {
    try {
        const pool = await connectionDB();
        const query = `SELECT ps.stock, ps.id, ps.price, fsi.id as flash_sale_item_id, fsi.flash_sale_price
                    FROM product_sizes ps
                    LEFT JOIN flash_sale_items fsi ON fsi.size_id = ps.id
                    WHERE ps.id = @size_id`;
        const result = await pool.request()
            .input('size_id', size_id)
            .query(query);
        if (result.recordset.length === 0) {
            return null;
        }
        return result.recordset[0];
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to fetch product size', 500, false);
    }
}

export const getAllProductsByShop = async (shop_id: number): Promise<ProductSummary[]> => {
    try {
        const pool = await connectionDB();
        const query = `${baseQuery}
                    HAVING sp.id = @shop_id`;
        const result = await pool.request().input('shop_id', shop_id).query(query);
        return result.recordset as ProductSummary[];
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to fetch products', 500, false);
    }
}
const makeProductSumary = (productMap: Map<number, ProductSummary> ,records: any) => {
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
            const product = productMap.get(id)!;
            if (flash_sale_price) {
                if (!product.flash_price || product.flash_price < flash_sale_price) {
                    product.flash_price = flash_sale_price;
                }
            }
        }
        const product = productMap.get(id)!;
        if (image_url && !product.images.includes(image_url)) {
            product.images.push(image_url);
        }
    }
}
export const getProductsActive = async (): Promise<ProductSummary[]> => {
    try {
        const query = `            
            SELECT  
                p.id,
                p.name,
                i.image_url,
                fsi.flash_sale_price,
                MIN(s.price) AS min_price,   
                MAX(s.price) AS max_price
            FROM products p
            INNER JOIN product_colors i ON i.product_id = p.id
            INNER JOIN product_sizes s ON s.color_id = i.id
            LEFT JOIN flash_sale_items fsi ON fsi.size_id = s.id AND fsi.status = 'active'
            LEFT JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active' 
            WHERE p.status = 'active'
            GROUP BY
                p.id, p.name, i.image_url, fsi.flash_sale_price`;
        const pool = await connectionDB();
        const result = await pool.request().query(query);
        const records = result.recordset;
        const productMap = new Map<number, ProductSummary>();
        makeProductSumary(productMap, records);

        return Array.from(productMap.values());
    } catch (error) {
        console.error(error);
        throw new AppError('Failed to fetch active products', 500, false);
    }
};

export const getAllProductsHidden = async (): Promise<ProductSummary[]> => {
    try {
        const query = `${baseQuery}
                    HAVING p.status = 'hidden'`
        const pool = await connectionDB();
        const result = await pool.request().query(query);
        return result.recordset as ProductSummary[];
    } catch (error) {
        console.error(error);
        throw new AppError('Failed to fetch hidden products', 500, false);
    }
}
export const getAllProductsHiddenByShop = async (shop_id: number): Promise<ProductSummary[]> => {
    try {
        const query = `${baseQuery}
                    HAVING p.status = 'hidden' AND sp.id = @shop_id`
        const pool = await connectionDB();
        const result = await pool.request().input('shop_id', shop_id).query(query);
        return result.recordset as ProductSummary[];
    } catch (error) {
        console.error(error);
        throw new AppError('Failed to fetch hidden products', 500, false);
    }
}
export const getProductById = async (id: number): Promise<ProductPayload> => {
    try {
        const pool = await connectionDB();
        const query = `SELECT 
                        p.id AS product_id,
                        p.shop_id,
                        sp.name AS shop_name,
                        p.category_id,
                        ct.category_name,
                        p.name AS product_name,
                        p.description,
                        p.status,
                        p.created_at,
                        s.id AS size_id,
                        s.size,
                        s.stock,
                        s.price,
                        cl.id AS color_id,
                        cl.image_url,
                        cl.is_main,
                        cl.color,
                        fsi.flash_sale_price,
                        ci.id as detail_image_id,
                        ci.image_url as detail_image
                    FROM products p
                        INNER JOIN product_colors cl ON p.id = cl.product_id
                        INNER JOIN product_sizes s ON cl.id = s.color_id
                        INNER JOIN color_images ci ON ci.color_id = cl.id 
                        INNER JOIN categories ct ON p.category_id = ct.category_id
                        INNER JOIN shops sp ON p.shop_id = sp.id
                        LEFT JOIN flash_sale_items fsi ON fsi.size_id = s.id AND fsi.status = 'active'
                        LEFT JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active'
                    WHERE p.id = @id`
        const result = await pool.request().input('id', id).query(query);
        const productsMap: Record<number, ProductPayload> = {};

        result.recordset.forEach((row) => {
            if (!productsMap[row.product_id]) {
                productsMap[row.product_id] = {
                    id: row.product_id,
                    shop_id: row.shop_id,
                    shop_name: row.shop_name,
                    category_id: row.category_id,
                    category_name: row.category_name,
                    name: row.product_name,
                    description: row.description,
                    status: row.status,
                    colors: []
                }
            }
            const product = productsMap[row.product_id];
            let color = product.colors.find(c => c.id === row.color_id);
            if (!color) {
                color = {
                    id: row.color_id,
                    product_id: row.product_id,
                    color: row.color,
                    image_url: row.image_url,
                    sizes: [],
                    images: [],
                    is_main: row.is_main === 1 ? true : false
                }
                product.colors.push(color);
            }
            if (row.size_id) {
                const size = color.sizes.find(s => s.id === row.size_id);
                if (!size) {
                    color.sizes.push({
                        product_id: row.product_id,
                        id: row.size_id,
                        stock: row.stock,
                        price: row.price,
                        size: row.size,
                        flash_sale_price: row.flash_sale_price
                    })
                }
            }
            if (row.detail_image) {
                const imagePath = `${row.detail_image}`;
                if (!color.images!.includes(imagePath)) {
                    color.images!.push(imagePath);
                }
            }
        })
        const productPayloads = Object.values(productsMap);

        return productPayloads[0];

    } catch (error) {
        console.error(error);
        throw new AppError('Failed to fetch products', 500, false);
    }
}
export const updateProductStatus = async (product_id: string, status: string): Promise<void> => {
    try {
        const pool = await connectionDB();
        const query = `UPDATE products SET status = @status WHERE id IN (${product_id})`;
        const result = await pool.request()
            .input('status', status)
            .query(query);
        if (!result.rowsAffected || result.rowsAffected[0] === 0) {
            throw new AppError('Product not found', 404, false);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update product status', 500, false);
    }
}

export const updateSizes = async (size: string, stock: number): Promise<void> => {
    try {
        const pool = await connectionDB();
        const query = `UPDATE product_sizes SET stock = @stock WHERE id IN (${size})`;
        const result = await pool.request()
            .input('stock', stock)
            .query(query);
        if (!result.rowsAffected || result.rowsAffected[0] === 0) {
            throw new AppError('Size not found', 404, false);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update sizes', 500, false);
    }
}
export const getProductByCategoryGender = async (gender: string): Promise<ProductSummary[]> => {
    try {
        let query = `${baseQuery}
                    HAVING c.gender = @gender`

        const pool = await connectionDB();
        const result = await pool.request()
            .input('gender', gender)
            .query(query);
        const records = result.recordset;
        const productMap = new Map<number, ProductSummary>();
        makeProductSumary(productMap, records);

        return Array.from(productMap.values());
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to fetch products by category', 500, false);
    }
}
const insertProduct = async (transaction: mssql.Transaction, product: ProductPayload): Promise<number> => {
    const query = `INSERT INTO products (shop_id, category_id, name, description)
                OUTPUT INSERTED.id AS product_id
                VALUES(@shop_id, @category_id, @name, @description)`;
    const result = await new mssql.Request(transaction)
        .input('shop_id', product.shop_id)
        .input('category_id', product.category_id)
        .input('name', product.name)
        .input('description', product.description)
        .query(query);
    return result.recordset[0].product_id;
}
const insertColorImages = async (transaction: mssql.Transaction, color_id: number, images: string[]): Promise<void> => {
    const query = `INSERT INTO color_images (color_id, image_url)
                VALUES (@color_id, @image_url)`
    for (const url of images) {
        await new mssql.Request(transaction)
            .input('color_id', color_id)
            .input('image_url', url)
            .query(query);
    }
}
const insertProductColors = async (transaction: mssql.Transaction, product_id: number, productColors: ProductColor[]): Promise<void> => {
    const query = `INSERT INTO product_colors (product_id, color, image_url, is_main)
                OUTPUT INSERTED.id AS color_id
                VALUES (@product_id, @color, @image_url, @is_main)`
    for (const color of productColors) {
        const result = await new mssql.Request(transaction)
            .input('product_id', product_id)
            .input('color', color.color)
            .input('image_url', color.image_url)
            .input('is_main', color.is_main ? 1 : 0)
            .query(query)
        const color_id = result.recordset[0].color_id;
        await insertProductSizes(transaction, color_id, color.sizes);
        await insertColorImages(transaction, color_id, color.images!)
    }
}
const insertProductSizes = async (transaction: mssql.Transaction, color_id: number, productSizes: ProductSize[]): Promise<void> => {
    const query = `INSERT INTO product_sizes (color_id, size, stock, price)
                VALUES(@color_id, @size, @stock, @price)`
    for (const size of productSizes) {
        await new mssql.Request(transaction)
            .input('color_id', color_id)
            .input('size', size.size)
            .input('stock', size.stock)
            .input('price', size.price)
            .query(query);
    }
}

export const addProduct = async (product: ProductPayload): Promise<void> => {
    const pool = await connectionDB();
    const transaction = new mssql.Transaction(pool);
    try {
        await transaction.begin();
        //insert product
        const product_id = await insertProduct(transaction, product);
        //insert colors and sizes
        await insertProductColors(transaction, product_id, product.colors);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        throw new AppError('Failed to add product', 500, false);
    }
}

const updateProductInfo = async (transaction: mssql.Transaction, product: ProductPayload): Promise<void> => {
    await transaction.request()
        .input("id", product.id)
        .input("category_id", product.category_id)
        .input("name", product.name)
        .input("description", product.description)
        .input("status", product.status)
        .query(`
            UPDATE products 
            SET category_id=@category_id, name=@name, description=@description, status=@status 
            WHERE id=@id
        `);
};
// Upsert bảng colors
const upsertProductColor = async (transaction: mssql.Transaction, productId: number, color: ProductColor): Promise<number> => {
    if (color.id) {
        await transaction.request()
            .input("id", color.id)
            .input("color", color.color)
            .input("image_url", color.image_url)
            .input("is_main", color.is_main ? 1 : 0)
            .query(`
                UPDATE product_colors 
                SET color=@color, image_url=@image_url, is_main=@is_main 
                WHERE id=@id
            `);
        return color.id;
    } else {
        const inserted = await transaction.request()
            .input("product_id", productId)
            .input("color", color.color)
            .input("image_url", color.image_url)
            .input("is_main", color.is_main ? 1 : 0)
            .query(`
                INSERT INTO product_colors (product_id, color, image_url, is_main)
                OUTPUT INSERTED.id
                VALUES (@product_id, @color, @image_url, @is_main)
            `);
        return inserted.recordset[0].id;
    }
};

// Upsert bảng sizes
const upsertProductSize = async (transaction: mssql.Transaction, colorId: number, size: ProductSize): Promise<void> => {
    if (size.id) {
        await transaction.request()
            .input("id", size.id)
            .input("size", size.size)
            .input("stock", size.stock)
            .input("price", size.price)
            .query(`
                UPDATE product_sizes 
                SET size=@size, stock=@stock, price=@price 
                WHERE id=@id
            `);
    } else {
        await transaction.request()
            .input("color_id", colorId)
            .input("size", size.size)
            .input("stock", size.stock)
            .input("price", size.price)
            .query(`
                INSERT INTO product_sizes (color_id, size, stock, price)
                VALUES (@color_id, @size, @stock, @price)
            `);
    }
};

export const updateProduct = async (product: ProductPayload): Promise<void> => {
    const pool = await connectionDB();
    const transaction = new mssql.Transaction(pool);
    try {
        await transaction.begin();

        // 1. Update product info
        await updateProductInfo(transaction, product);

        // 2. Upsert colors + sizes
        for (const color of product.colors) {
            const colorId = await upsertProductColor(transaction, Number(product.id), color);
            for (const size of color.sizes) {
                await upsertProductSize(transaction, colorId, size);
            }
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


export const getCategoryById = async (category_id: number): Promise<boolean> => {
    try {
        const pool = await connectionDB();
        const query = 'SELECT COUNT(*) as count FROM categories WHERE category_id = @category_id';
        const result = await pool.request()
            .input('category_id', category_id)
            .query(query);
        return result.recordset[0].count > 0;
    } catch (error) {
        throw new AppError('Failed to fetch category', 500, false);
    }
}

export const getProductByName = async (name: string): Promise<ProductSummary[]> => {
    try {
        const pool = await connectionDB();
        const query = `
                SELECT  
                p.id,
                p.name,
                p.description,
                p.status,
                i.image_url,
                fsi.flash_sale_price,
                i.is_main AS thumbnail,
                MIN(s.price) AS min_price,   
                MAX(s.price) AS max_price
            FROM products p
            INNER JOIN product_colors i ON i.product_id = p.id
            INNER JOIN product_sizes s ON s.color_id = i.id
            LEFT JOIN flash_sale_items fsi ON fsi.size_id = s.id AND fsi.status = 'active'
            LEFT JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active' 
            GROUP BY 
                p.id, p.name, p.description, p.status, i.image_url, fsi.flash_sale_price, i.is_main
            HAVING p.name LIKE '%' + @name + '%'  `;
        const result = await pool.request()
            .input('name', name)
            .query(query);
        
        return mapToProductSummary(result.recordset);
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to fetch product ', 500, false);
    }
}

export const softDeleteProduct = async (id: number): Promise<void> => {
    try {
        const query = `UPDATE products SET status = 'hidden' WHERE id = @id`;
        const pool = await connectionDB();
        await pool.request()
            .input('id', id)
            .query(query);
    } catch (error) {
        throw error;
    }
}

export const getLatestProducts = async (limit: number): Promise<ProductSummary[]> => {
    try {
        const query = `WITH NewProducts AS (
                            SELECT TOP ${limit}
                                p.id
                            FROM products p
                            INNER JOIN product_colors i ON i.product_id = p.id
                            INNER JOIN product_sizes s ON s.color_id = i.id
                            GROUP BY p.id                        
                            ORDER BY p.id DESC 
                        )
                        SELECT
                            p.id,
                            p.name,
                            p.description,
                            p.status,
                            i.is_main AS thumbnail,
                            i.image_url,
                            MIN(fsi.flash_sale_price) AS flash_sale_price,
                            MIN(s.price) AS min_price,
                            MAX(s.price) AS max_price,
                            0 AS sold_quantity 
                        FROM NewProducts np
                        INNER JOIN products p ON p.id = np.id
                        INNER JOIN product_colors i ON i.product_id = p.id
                        INNER JOIN product_sizes s ON s.color_id = i.id
                        LEFT JOIN flash_sale_items fsi ON fsi.size_id = s.id AND fsi.status = 'active'
                        LEFT JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active' 
                                                
                        GROUP BY
                            p.id, p.name, p.description, p.status, i.image_url, i.is_main
                        ORDER BY p.id DESC
                        `;
        const pool = await connectionDB();
        const result = await pool.request()
            .query(query);
        return mapToProductSummary(result.recordset);

    } catch (error) {
        console.log("Erorr fetching fetch lates products", error)
        throw new AppError('Failed to fetch lates products', 500, false);
    }
}
        
export const getProductsByCategory = async (arrayName: string): Promise<ProductSummary[]> => {
    try {
        const query = `${baseQuery}
                    HAVING c.category_name IN (${arrayName})`

        const pool = await connectionDB();
        const result = await pool.request()
            .query(query);
        const productsMap = new Map<number, ProductSummary>();
        makeProductSumary(productsMap, result.recordset);

        return Array.from(productsMap.values());
    } catch (error) {
        throw new AppError('Failed to fetch products by category', 500, false);
    }
}

export const getProductByShop = async (shop_id: number): Promise<ProductSummary[]> => {
    try {
        const query = `${baseQuery}
                    HAVING p.shop_id = @shop_id`
        const pool = await connectionDB();
        const product = await pool.request()
            .input('shop_id', shop_id)
            .query(query);
        const productMap = new Map<number, ProductSummary>();
        makeProductSumary(productMap, product.recordset);
        return Array.from(productMap.values());
    } catch (error) {
        console.log(error);
        throw new AppError('Failed to fetch products by shop', 500, false);
    }
}
export const getBestSellerProduct = async (limit: number): Promise<ProductSummary[]> => {
    try {
        // const query = `WITH TopProducts AS (
        //                     SELECT TOP ${limit}
        //                         p.id,
        //                         ISNULL(SUM(oi.quantity), 0) AS sold_quantity
        //                     FROM products p
        //                     INNER JOIN product_colors i ON i.product_id = p.id
        //                     INNER JOIN product_sizes s ON s.color_id = i.id
        //                     LEFT JOIN order_items oi ON oi.size_id = s.id
        //                     GROUP BY p.id
        //                     ORDER BY sold_quantity DESC
        //                 )
        //                 SELECT
        //                     p.id,
        //                     p.name,
        //                     p.description,
        //                     p.status,
        //                     thumb.image_url AS thumbnail,
        //                     i.image_url,
        //                     MIN(fsi.flash_sale_price) AS flash_sale_price,
        //                     MIN(s.price) AS min_price,
        //                     MAX(s.price) AS max_price,
        //                     tp.sold_quantity 
        //                 FROM TopProducts tp
        //                 INNER JOIN products p ON p.id = tp.id
        //                 INNER JOIN product_colors i ON i.product_id = p.id
        //                 INNER JOIN product_sizes s ON s.color_id = i.id
        //                 LEFT JOIN product_colors thumb 
        //                     ON thumb.product_id = p.id AND thumb.is_main = 1
        //                 LEFT JOIN flash_sale_items fsi ON fsi.size_id = s.id AND fsi.status = 'active'
        //                 LEFT JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active' 
        //                 GROUP BY
        //                     p.id, p.name, p.description, p.status, i.image_url, thumb.image_url, tp.sold_quantity
        //                 ORDER BY tp.sold_quantity DESC
        //                 `;
        const query = `
        WITH ProductSales AS (
                SELECT
                    t1.product_id,
                    SUM(oi.quantity) AS sold_quantity
                FROM order_items oi
                INNER JOIN product_sizes s ON s.id = oi.size_id
                INNER JOIN product_colors t1 ON t1.id = s.color_id
                GROUP BY t1.product_id
            ),
            TopProducts AS (
                SELECT TOP ${limit}
                    p.id,
                    ISNULL(ps.sold_quantity, 0) AS sold_quantity
                FROM products p
                LEFT JOIN ProductSales ps ON ps.product_id = p.id
                ORDER BY sold_quantity DESC
            ),
            ProductPrices AS (
                SELECT
                    s.color_id,
                    s.price,
                    MIN(fsi.flash_sale_price) AS flash_sale_price
                FROM product_sizes s
                LEFT JOIN flash_sale_items fsi ON fsi.size_id = s.id AND fsi.status = 'active'
                LEFT JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active'
                GROUP BY s.color_id, s.price
            )
            SELECT
                p.id,
                p.name,
                p.description,
                p.status,
                i.is_main AS thumbnail,
                i.image_url,
                MIN(pp.flash_sale_price) AS flash_sale_price,
                MIN(pp.price) AS min_price,
                MAX(pp.price) AS max_price,
                tp.sold_quantity 
            FROM TopProducts tp
            INNER JOIN products p ON p.id = tp.id
            INNER JOIN product_colors i ON i.product_id = p.id
            INNER JOIN ProductPrices pp ON pp.color_id = i.id
            GROUP BY
                p.id, p.name, p.description, p.status, i.image_url, i.is_main, tp.sold_quantity
            ORDER BY tp.sold_quantity DESC
    `;
        const pool = await connectionDB();
        const result = await pool.request()
            .query(query);
        return mapToProductSummary(result.recordset);

    } catch (error) {
        console.log("Erorr fetching best seller products", error)
        throw new AppError('Failed to fetch best seller products', 500, false);
    }
}
export const mapToProductSummary = (rows: any[]): ProductSummary[] => {
    const map = new Map<number, ProductSummary>();

    for (const row of rows) {
        // Biến tạm để lấy URL ảnh nếu đây là ảnh chính (thumbnail)
        const isThumbnail = row.thumbnail === true; 
        const thumbnailUrl = isThumbnail ? row.image_url : null;

        if (!map.has(row.id)) {
            map.set(row.id, {
                id: row.id,
                name: row.name,
                description: row.description,
                // Gán thumbnail nếu row.thumbnail là TRUE
                thumbnail: thumbnailUrl, 
                min_price: row.min_price,
                max_price: row.max_price,
                sold_quantity: row.sold_quantity ?? 0, // Đảm bảo là số
                avg_rating: 0, 
                flash_price: row.flash_sale_price ?? undefined,
                images: row.image_url ? [row.image_url] : []
            });
        } else {
            const product = map.get(row.id)!;
            
            // 1. Cập nhật Thumbnail nếu dòng này là ảnh chính VÀ thumbnail chưa được gán
            if (isThumbnail && !product.thumbnail) {
                product.thumbnail = thumbnailUrl;
            }

            // 2. Thêm ảnh nếu chưa có
            if (row.image_url && !product.images.includes(row.image_url)) {
                product.images.push(row.image_url);
            }

            // 3. Cập nhật các giá trị tổng hợp
            product.min_price = Math.min(product.min_price, row.min_price);
            product.max_price = Math.max(product.max_price, row.max_price);

            if (row.flash_sale_price != null) {
                if (!product.flash_price || row.flash_sale_price < product.flash_price) {
                    product.flash_price = row.flash_sale_price;
                }
            }
            
            // Nếu bạn giữ logic GROUP BY cũ, sold_quantity đã là tổng cho nhóm
            // product.sold_quantity = Math.max(product.sold_quantity, row.sold_quantity);
            // Nhưng với cấu trúc hiện tại, chúng ta không cần cập nhật sold_quantity ở đây
            
        }
    }

    return Array.from(map.values());
};
export const getMostDiscountedProduct = async (limit: number): Promise<ProductSummary[]> => {
    try {
        return [];
    } catch (error) {
        console.log("Erorr fetching most discounted products");
        throw new AppError('Failed to fetch most discounted products', 500, false);
    }
}

export const getProductPayloadOfShop = async (shop_id: number): Promise<ProductPayload[]> => {
    const pool = await connectionDB();
    const result = await pool.request()
        .input("shop_id", shop_id)
        .query(`
      SELECT 
          p.id AS product_id,
          p.shop_id,
          sp.name AS shop_name,
          p.category_id,
          p.name AS product_name,
          p.description,
          p.status,
          p.created_at,
          s.id AS size_id,
          s.size,
          s.stock,
          s.price,
          cl.id AS color_id,
          cl.image_url,
          cl.is_main,
          cl.color,
          fsi.flash_sale_price,
          ISNULL(SUM(oi.quantity), 0) AS sold_count
      FROM products p
          INNER JOIN product_colors cl ON p.id = cl.product_id
          INNER JOIN product_sizes s ON cl.id = s.color_id
          INNER JOIN shops sp ON p.shop_id = sp.id
          LEFT JOIN flash_sale_items fsi ON fsi.size_id = s.id AND fsi.status = 'active'
          LEFT JOIN flash_sales fs ON fs.id = fsi.flash_sale_id AND fs.status = 'active'
          LEFT JOIN order_items oi ON oi.size_id = s.id
      WHERE p.shop_id = @shop_id
      GROUP BY 
          p.id, p.shop_id, sp.name, p.category_id, p.name, p.description, p.status, p.created_at,
          s.id, s.size, s.stock, s.price,
          cl.id, cl.image_url, cl.is_main, cl.color,
          fsi.flash_sale_price
       ORDER BY p.id DESC
    `);

    const rows = result.recordset;
    const productsMap = new Map<number, ProductPayload>();

    for (const row of rows) {
        let product = productsMap.get(row.product_id);
        if (!product) {
            product = {
                id: row.product_id,
                shop_id: row.shop_id,
                shop_name: row.shop_name,
                category_id: row.category_id,
                name: row.product_name,
                description: row.description,
                status: row.status,
                colors: [],
                sold_product: 0 
            };
            productsMap.set(row.product_id, product);
        }

        let color = product.colors.find(c => c.id === row.color_id);
        if (!color) {
            color = {
                id: row.color_id,
                product_id: row.product_id,
                color: row.color,
                image_url: row.image_url,
                is_main: row.is_main,
                sizes: [],
                sold_count: 0
            };
            product.colors.push(color);
        }

        if (!color.sizes.some(s => s.id === row.size_id)) {
            const size: ProductSize = {
                id: row.size_id,
                product_id: row.product_id,
                size: row.size,
                stock: row.stock,
                price: row.price,
                flash_sale_price: row.flash_sale_price
            };
            color.sizes.push(size);
        }

        color.sold_count += row.sold_count ?? 0;
    }

    for (const product of productsMap.values()) {
        product.sold_product = product.colors.reduce((sum, color) => sum + (color.sold_count || 0), 0);
    }

    return Array.from(productsMap.values());
};
export const getProductIdBySizeId = async (size_id: number): Promise<number> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input('size_id', size_id)
            .query(`
                SELECT pc.product_id
                FROM product_sizes ps
                INNER JOIN product_colors pc ON ps.color_id = pc.id
                WHERE ps.id = @size_id
            `);

        if (!result.recordset.length) {
            throw new AppError('Size not found', 404, false);
        }

        return result.recordset[0].product_id;
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch product id from size id', 500, false);
    }
};
