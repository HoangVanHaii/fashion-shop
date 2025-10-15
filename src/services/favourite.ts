import { FavouritePayload } from "../interfaces/favourite";
import { AppError } from "../utils/appError"
import { connectionDB } from "../config/database";

export const createFavourite = async (favourite: FavouritePayload): Promise<void> => {
    try {
        const pool = await connectionDB();
        const query = `INSERT INTO favourites (user_id, product_id, created_at)
                       VALUES (@user_id, @product_id, @created_at)`;
        await pool.request()
            .input("user_id", favourite.user_id)
            .input("product_id", favourite.product_id)
            .input("created_at", favourite.created_at || new Date())
            .query(query);
    } catch (error: any) {
        throw new AppError('Failed to create favourite', 500, false);
    }
}
export const deleteFavourite = async (user_id: number, product_id: number): Promise<void> => {
    try {
        const pool = await connectionDB(); 
        const query = `DELETE FROM favourites WHERE user_id = @user_id AND product_id = @product_id`;
        await pool.request()
            .input("user_id", user_id)
            .input("product_id", product_id)
            .query(query);
    } catch (error: any) {
        throw new AppError('Failed to delete favourite', 500, false);
    } 
}
export const getFavouritesByUserId = async (user_id: number): Promise<FavouritePayload[]> => {
    try {
        const pool = await connectionDB(); 
        const query = `SELECT * FROM favourites WHERE user_id = @user_id`;
        const result = await pool.request()
            .input("user_id", user_id)
            .query(query);
        return result.recordset;
    } catch (error: any) {
        throw new AppError('Failed to fetch favourites', 500, false);
    }   
}
