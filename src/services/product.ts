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
