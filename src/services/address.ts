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

export const getAddressById = async (userId: number, addressId: number): Promise<Address | null> => {
  try {
    const pool = await connectionDB();
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
  } catch (error) {
    throw new AppError("Failed to get address", 500, false);
  }
};

export const updateAddress = async (address: Address): Promise<void> => {
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

    let updates: string[] = [];
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
  } catch (error) {
    throw new AppError("Failed to update address", 500, false);
  }
};

export const deleteAddress = async (userId: number, addressId: number, is_default: boolean): Promise<void> => {
  try {
    const pool = await connectionDB();

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
  } catch (error) {
    throw new AppError("Failed to delete address", 500, false);
  }
};
