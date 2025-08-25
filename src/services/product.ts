import  { Product } from '../interfaces/product';
import { connectionDB } from '../config/database';

export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const query = 'SELECT * FROM products';
        const pool = await connectionDB();
        const result = await pool.request().query(query);
        return result.recordset as Product[];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}
export const addProduct = async (product: Product): Promise<void> => {
    try {
        const query = `INSERT INTO products (shop_id, category_id, name, description, price, stock)
                       VALUES (@shop_id, @category_id,@name, @description, @price, @stock)`;
        const pool = await connectionDB();
        await pool.request()
            .input('shop_id', product.shop_id)
            .input('category_id', product.category_id)
            .input('name', product.name)
            .input('description', product.description)
            .input('price', product.price)
            .input('stock', product.stock)
            .query(query);
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
}
export const updateProduct = async (product: Product): Promise<void> => {
    try {
        const pool = await connectionDB();
        let updates: string[] = [];
        let request = pool.request();        
        Object.entries(product).forEach(([key, value])=> {
            if(key !== 'id' && key !== 'shop_id' && value !== undefined) {
                updates.push(`${key} = @${key}`);
                request.input(key, value);
            }
        })
        const query = `UPDATE products
                       SET ${updates.join(', ')}
                       WHERE id = @id`;
        request.input('id', product.id);
        await request.query(query);
    } catch (error) {
        // console.error('Error updating product:', error);
        throw error;
    }
}
export const checkCategoryExists = async (category_id: number): Promise<boolean> => {
    try {
        const pool = await connectionDB();
        const query = 'SELECT COUNT(*) as count FROM categories WHERE category_id = @category_id';
        const result = await pool.request()
            .input('category_id', category_id)
            .query(query);
        return result.recordset[0].count > 0;   
    } catch (error) {
        console.error('Error checking category existence:', error);
        return false;   
    }
}
export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const pool = await connectionDB();
        const query = 'SELECT * FROM products WHERE id = @id';
        const result = await pool.request()
            .input('id', id)
            .query(query);
        return result.recordset[0] as Product || null;   
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        return null;   
    }
}
export const getProductByName = async (name: string): Promise<Product[]> => {
    try {
        const pool = await connectionDB();
        const query = 'SELECT * FROM products WHERE name LIKE @name';
        const result = await pool.request()
            .input('name', `%${name}%`)
            .query(query);
        // console.log("a ",result.recordset);   
        return result.recordset as Product[];   
    } catch (error) {
        console.error('Error fetching product by name:', error);
        return [];   
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
        console.error('Error soft deleting product:', error);
        throw error;
    }
}
export const getProductsActive = async (): Promise<Product[]> => {
    try {
        const query = "SELECT * FROM products WHERE status = 'active'";
        const pool = await connectionDB();
        const result = await pool.request().query(query);
        return result.recordset as Product[];
    } catch (error) {
        console.error('Error fetching active products:', error);
        return [];
    }
}
export const getLatestProducts = async (limit: number): Promise<Product[]> => {
    try {
        const query = 'SELECT TOP (@limit) * FROM products ORDER BY id DESC';
        const pool = await connectionDB();
        const result = await pool.request()
            .input('limit', limit)
            .query(query);
        return result.recordset as Product[];
    } catch (error) {
        console.error('Error fetching latest products:', error);
        return [];
    }
}
export const getProductsByCategory = async (category_id: number): Promise<Product[]> => {
    try {
        const query = 'SELECT * FROM products WHERE category_id = @category_id';
        const pool = await connectionDB();
        const result = await pool.request()
            .input('category_id', category_id)
            .query(query);
        return result.recordset as Product[];
    } catch (error) {
        console.error('Error fetching products by category:', error);
        return [];
    }
}
export const getProductByShop = async (shop_id:number) : Promise<Product[]> => {
    try {
        const query = `SELECT *FROM products WHERE shop_id = @shop_id`;
        const pool = await connectionDB();
        const product = await pool.request()
            .input('shop_id', shop_id)
            .query(query);
        return product.recordset as Product[];
    } catch (error) {
        console.log("Error fetching product by shop: ", error);
        return [];
    }
}
export const getBestSellerProduct = async(limit: number) : Promise<Product[]> => {
    try {
        return []
    } catch (error) {
        console.log("Erorr fetching best seller products")
        return [];
    }
}
export const getMostDiscountedProduct = async(limit: number) : Promise<Product[]>=> {
    try {
        return [];
    } catch (error) {
        console.log("Erorr fetching most discounted products");
        return [];
    }
}