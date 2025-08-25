import { connectionDB } from "../config/database";
import { User } from "../interfaces/user";
import bcrypt from "bcryptjs";
import * as jwtUtils from "../utils/jwt" 

export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("email", email)
            .query(`SELECT name, email, address, id
                 FROM users
                 WHERE email = @email AND is_verified = 1`);
        
        return result.recordset[0] || null;

    } catch (err : any) {
        throw { status: err.status || 500, message: err.message || "Internal server error" };
    }
}

export const getUserById = async (id: Number): Promise<User | null> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("id", id)
            .query(`SELECT u.id, u.name, u.email, u.address
                FROM users u
                WHERE u.id = @id`);

        return result.recordset[0] || null;
    } catch (err : any) {
        throw { status: err.status || 500, message: err.message || "Internal server error" };
    }
}

export const registerUser = async (user: User): Promise<void> => {
    try {
        const pool = await connectionDB();

        await pool.request()
            .input("email", user.email)
            .query(`DELETE FROM users WHERE email = @email AND is_verified = 0`);


        const hashedPassword = await bcrypt.hash(user.password, 10);
        await pool.request()
            .input("name", user.name)
            .input("email", user.email)
            .input("password", hashedPassword)
            .input("role", user.role || "customer")
            .query(`INSERT INTO users(name, email, password, role)
                    VALUES (@name, @email, @password, @role)`);
    } catch (err: any) {
        throw {status: err.message || 500, message: err.message || "Internal server error"};
    }
}
export const verifyUser = async (email: string): Promise<void> => {
    try {
        const pool = await connectionDB();
        await pool.request()
            .input("email", email)
            .query(`UPDATE users SET is_verified = 1 WHERE email = @email`);
        
    } catch (err : any) {
        throw { status: err.status || 500, message: err.message || "Internal server error" };
    }
}
export const loginUser = async (email: string, password: string) => {
    try {
        
        const pool = await connectionDB();
        const result = await pool.request()
            .input("email", email)
            .query(`SELECT u.id, u.name, u.email, u.role, u.password
                FROM users u
                WHERE email = @email AND is_verified = 1`)
        
        if (result.recordset.length === 0) {
            throw { status: 404, message: "User not found" };
        }
        const user = result.recordset[0];
        const isMatch = await bcrypt.compare(password, result.recordset[0].password);
        if (!isMatch) {
            throw { status: 401, message: "Invalid password" };
        }
        const accessToken = jwtUtils.accessToken(user.id, user.email, user.role);
        const refreshToken = jwtUtils.refreshToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            accessToken,
            refreshToken
         };

    } catch (err: any) {
        throw { status: err.status || 500, message: err.message || "Internal server error" };
    }
}

export const updateProfile = async(id: Number, name: string, address: string): Promise<void> => {
    try {
        const pool = await connectionDB();
        const checkUser = await pool.request()
            .input("id", id)
            .query(`SELECT u.name, u.email, u.id, u.address
                FROM users
                WHERE u.id = @id`);
    } catch (err : any) {
        throw { status: err.status, message: err.message };
    }
}
