import { connectionDB } from "../config/database";
import { Category } from "../interfaces/category";
import { AppError } from "../utils/appError";

export const addCategory = async (category: Category): Promise<void> => {
    try {
        const pool = await connectionDB();
        await pool.request()
            .input("category_name", category.category_name)
            .input("description", category.description || null)
            .input("status", category.status || "active")
            .query(`
        INSERT INTO categories (category_name, description, status)
        VALUES (@category_name, @description, @status)
      `);
    } catch (error) {
        throw new AppError("Failed to add category", 500, false);
    }
};

export const getAllActiveCategories = async (): Promise<Category[]> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .query(`
        SELECT category_id, category_name, description, status
        FROM categories
        WHERE status = 'active'
      `);
        return result.recordset;
    } catch (error) {
        throw new AppError("Failed to get active categories", 500, false);
    }
};
export const getCategoryNamByGender = async (gender: string) : Promise<string[] | null> => {
    try {
        const pool = await connectionDB();
        const query = `SELECT category_name
                    FROM categories 
                    WHERE gender = @gender`;
        const result = await pool.request()
            .input('gender', gender)
            .query(query);

        if(!result) return null;

        return result.recordset as string[];
    } catch (error) {
        console.log("Failed to fetching category name",error);
        throw new AppError('Failed to fetching category name', 500, false);
    }
}
export const getAllInactiveCategories = async (): Promise<Category[]> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .query(`
        SELECT category_id, category_name, description, status
        FROM categories
        WHERE status = 'inactive'
      `);
        return result.recordset;
    } catch (error) {
        throw new AppError("Failed to get inactive categories", 500, false);
    }
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("id", id)
            .query(`
        SELECT category_id, category_name, description, status
        FROM categories
        WHERE category_id = @id
      `);

        if (result.recordset.length === 0) return null;
        return result.recordset[0];
    } catch (error) {
        throw new AppError("Failed to get category by id", 500, false);
    }
};


export const updateCategory = async (category: Category): Promise<void> => {
    try {
        const pool = await connectionDB();

        let updates: string[] = [];
        let request = pool.request();

        Object.entries(category).forEach(([key, value]) => {
            if (key !== "category_id" && value !== undefined && value !== null && value !== "") {
                updates.push(`${key} = @${key}`);
                request.input(key, value);
            }
        });

        if (updates.length === 0) return;

        request.input("id", category.category_id);

        const query = `
      UPDATE categories
      SET ${updates.join(", ")}
      WHERE category_id = @id
    `;

        await request.query(query);
    } catch (error) {
        throw new AppError("Failed to update category", 500, false);
    }
};

export const deleteCategory = async (id: number): Promise<void> => {
    try {
        const pool = await connectionDB();
        await pool.request()
            .input("id", id)
            .query(`
        UPDATE categories
        SET status = 'inactive'
        WHERE category_id = @id
      `);
    } catch (error) {
        throw new AppError("Failed to soft delete category", 500, false);
    }
};
