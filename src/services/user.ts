import { connectionDB } from "../config/database";
import { User } from "../interfaces/user";
import bcrypt from "bcryptjs";

export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("email", email)
            .query(`SELECT * FROM users WHERE email = @email AND is_verified = 1`);
        
        return result.recordset[0] || null;

    } catch (err : any) {
        console.error("Lỗi getUserByEmail", err.message);
        throw { status: 500, message: "Lỗi lấy người dùng bằng email" };
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
        console.error("Lỗi service createUser:", err.message);
        throw {status: 500, message: "Không thể tạo user mới"};
    }
}
export const verifyUser = async (email: string): Promise<void> => {
    try {
        const pool = await connectionDB();
        await pool.request()
            .input("email", email)
            .query(`UPDATE users SET is_verified = 1 WHERE email = @email`);
        
    } catch (err : any) {
        console.error("Lỗi xác nhận đăng ký:", err.message);     
        throw new Error(err);
    }

 }


