"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getAllInactiveCategories = exports.getCategoryNamByGender = exports.getAllActiveCategories = exports.addCategory = void 0;
const database_1 = require("../config/database");
const appError_1 = require("../utils/appError");
const addCategory = async (category) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        await pool.request()
            .input("category_name", category.category_name)
            .input("description", category.description || null)
            .input("status", category.status || "active")
            .input('gender', category.gender)
            .query(`
        INSERT INTO categories (category_name, description, status, gender)
        VALUES (@category_name, @description, @status, @gender)
      `);
    }
    catch (error) {
        throw new appError_1.AppError("Failed to add category", 500, false);
    }
};
exports.addCategory = addCategory;
const getAllActiveCategories = async () => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .query(`
        SELECT category_id, category_name, description, status, gender
        FROM categories
        WHERE status = 'active'
      `);
        return result.recordset;
    }
    catch (error) {
        throw new appError_1.AppError("Failed to get active categories", 500, false);
    }
};
exports.getAllActiveCategories = getAllActiveCategories;
const getCategoryNamByGender = async (gender) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const query = `SELECT category_name
                    FROM categories 
                    WHERE gender = @gender`;
        const result = await pool.request()
            .input('gender', gender)
            .query(query);
        if (!result)
            return null;
        const categoryNames = result.recordset.map(row => row.category_name);
        return categoryNames;
    }
    catch (error) {
        console.log("Failed to fetching category name", error);
        throw new appError_1.AppError('Failed to fetching category name', 500, false);
    }
};
exports.getCategoryNamByGender = getCategoryNamByGender;
const getAllInactiveCategories = async () => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .query(`
        SELECT category_id, category_name, description, status, gender
        FROM categories
        WHERE status = 'inactive'
      `);
        return result.recordset;
    }
    catch (error) {
        throw new appError_1.AppError("Failed to get inactive categories", 500, false);
    }
};
exports.getAllInactiveCategories = getAllInactiveCategories;
const getCategoryById = async (id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("id", id)
            .query(`
        SELECT category_id, category_name, description, status, gender
        FROM categories
        WHERE category_id = @id
      `);
        if (result.recordset.length === 0)
            return null;
        return result.recordset[0];
    }
    catch (error) {
        throw new appError_1.AppError("Failed to get category by id", 500, false);
    }
};
exports.getCategoryById = getCategoryById;
const updateCategory = async (category) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        let updates = [];
        let request = pool.request();
        Object.entries(category).forEach(([key, value]) => {
            if (key !== "category_id" && value !== undefined && value !== null && value !== "") {
                updates.push(`${key} = @${key}`);
                request.input(key, value);
            }
        });
        if (updates.length === 0)
            return;
        request.input("id", category.category_id);
        const query = `
            UPDATE categories
            SET ${updates.join(", ")}
            WHERE category_id = @id
        `;
        await request.query(query);
    }
    catch (error) {
        throw new appError_1.AppError("Failed to update category", 500, false);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        await pool.request()
            .input("id", id)
            .query(`
        UPDATE categories
        SET status = 'inactive'
        WHERE category_id = @id
      `);
    }
    catch (error) {
        throw new appError_1.AppError("Failed to soft delete category", 500, false);
    }
};
exports.deleteCategory = deleteCategory;
