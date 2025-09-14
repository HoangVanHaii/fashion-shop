import { connectionDB } from "../config/database";
import { Address } from "../interfaces/address";
import { AppError } from "../utils/appError";
export const addAddress = async (address: Address): Promise<void> => {
    try {
        const pool = await connectionDB();
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
    } catch (error) {
        throw new AppError("Failed to add address", 500, false);
    }
};

export const getAddressesByUser = async (userId: number): Promise<Address[]> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("user_id", userId)
            .query(`
                SELECT id, user_id, name, address, phone, is_default
                FROM addresses
                WHERE user_id = @user_id
            `);
        return result.recordset;
    } catch (error) {
        throw new AppError("Failed to get addresses", 500, false);
    }
};

export const getAllAddresses = async (user_id: number): Promise<Address[]> => {
  try {
    const pool = await connectionDB();
    const result = await pool
      .request()
      .input("user_id", user_id)
      .query("SELECT * FROM addresses WHERE user_id = @user_id ORDER BY created_at DESC");

    return result.recordset;
  } catch (error) {
    throw new AppError("Failed to fetch addresses", 500, false);
  }
};