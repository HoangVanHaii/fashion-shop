"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.getAddressById = exports.getAddressesByUser = exports.addAddress = void 0;
const database_1 = require("../config/database");
const appError_1 = require("../utils/appError");
const addAddress = async (address) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        if (address.is_default) {
            await pool.request()
                .input("user_id", address.user_id)
                .query(`
                UPDATE addresses
                SET is_default = 0
                WHERE user_id = @user_id
            `);
        }
        await pool.request()
            .input("user_id", address.user_id)
            .input("name", address.name)
            .input("address", address.address)
            .input("phone", address.phone)
            .input("is_default", address.is_default)
            .query(`
                INSERT INTO addresses (user_id, name, address, phone, is_default)
                VALUES (@user_id, @name, @address, @phone, @is_default)
            `);
    }
    catch (error) {
        console.log(error);
        throw new appError_1.AppError("Failed to add address", 500, false);
    }
};
exports.addAddress = addAddress;
const getAddressesByUser = async (userId) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("user_id", userId)
            .query(`
                SELECT id, user_id, name, address, phone, is_default
                FROM addresses
                WHERE user_id = @user_id
            `);
        return result.recordset;
    }
    catch (error) {
        throw new appError_1.AppError("Failed to get addresses", 500, false);
    }
};
exports.getAddressesByUser = getAddressesByUser;
const getAddressById = async (userId, addressId) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        const result = await pool.request()
            .input("user_id", userId)
            .input("id", addressId)
            .query(`
        SELECT id, user_id, name, address, phone, is_default
        FROM addresses
        WHERE id = @id AND user_id = @user_id
      `);
        if (result.recordset.length === 0) {
            return null;
        }
        return result.recordset[0];
    }
    catch (error) {
        throw new appError_1.AppError("Failed to get address", 500, false);
    }
};
exports.getAddressById = getAddressById;
const updateAddress = async (address) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        if (address.is_default) {
            await pool.request()
                .input("user_id", address.user_id)
                .query(`
          UPDATE addresses
          SET is_default = 0
          WHERE user_id = @user_id
        `);
        }
        let updates = [];
        let request = pool.request();
        Object.entries(address).forEach(([key, value]) => {
            if (key !== "id" && key !== "user_id" && value !== undefined && value !== null && value !== "") {
                updates.push(`${key} = @${key}`);
                request.input(key, value);
            }
        });
        if (updates.length === 0) {
            return;
        }
        request.input("id", address.id);
        request.input("user_id", address.user_id);
        const query = `
      UPDATE addresses
      SET ${updates.join(", ")}
      WHERE id = @id AND user_id = @user_id
    `;
        await request.query(query);
    }
    catch (error) {
        throw new appError_1.AppError("Failed to update address", 500, false);
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (userId, addressId, is_default) => {
    try {
        const pool = await (0, database_1.connectionDB)();
        // Xóa address
        await pool.request()
            .input("user_id", userId)
            .input("id", addressId)
            .query(`
        DELETE FROM addresses
        WHERE id = @id AND user_id = @user_id
      `);
        // Nếu là default → set 1 cái khác làm default
        if (is_default) {
            await pool.request()
                .input("user_id", userId)
                .query(`
          UPDATE addresses
          SET is_default = 1
          WHERE id = (
            SELECT TOP 1 id FROM addresses
            WHERE user_id = @user_id
            ORDER BY id ASC
          )
        `);
        }
    }
    catch (error) {
        throw new appError_1.AppError("Failed to delete address", 500, false);
    }
};
exports.deleteAddress = deleteAddress;
