import { connectionDB } from "../config/database";
import { User } from "../interfaces/user";
import bcrypt from "bcryptjs";
import * as utils from "../utils/sendOTP";
import * as jwtUtils from "../utils/jwt" 
import * as otpService from "../services/otp";

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
        throw err;      
    }
}

export const getUserById = async (id: number): Promise<User | null> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("id", id)
            .query(`SELECT u.id, u.name, u.email, u.address
                FROM users u
                WHERE u.id = @id`);

        return result.recordset[0] || null;
    } catch (err : any) {
        throw err;
    }
}
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .query(`select * from users`);
        return result.recordset as User[];
    } catch (err : any) {
        throw { err };
    }
}

export const registerUser = async (user: User): Promise<void> => {
    try {
        const pool = await connectionDB();
        if (!user.email) {
            return;
        }
        const existingUser = await getUserByEmail(user.email);
        if (existingUser) {
            throw { status: 409, message: "Email already exists" };
        }   

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
export const verifyRegisterUser = async (email: string): Promise<void> => {
    try {
        const pool = await connectionDB();
        await pool.request()
            .input("email", email)
            .query(`UPDATE users SET is_verified = 1 WHERE email = @email`);
        
    } catch (err : any) {
        throw err;
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
        delete user.password;

        const accessToken = jwtUtils.accessToken(user.id, user.email, user.role);
        const refreshToken = jwtUtils.refreshToken(user.id, user.email, user.role);

        return {
            // user,
            accessToken,
            refreshToken
         };

    } catch (err: any) {
        throw { status: err.status || 500, message: err.message || "Internal server error" };
    }
}
export const updateProfile = async(id: number, name: string, address: string, password: string): Promise<void> => {
    try {
        const pool = await connectionDB();
        const checkPassword = await pool.request()
            .input("id", id)
            .query(`SELECT password FROM users WHERE id = @id`);
        if (checkPassword.recordset.length === 0) {
            throw { status: 404, message: "User not found" };
        }
        const isMatch = await bcrypt.compare(password, checkPassword.recordset[0].password);
        if (!isMatch) {
            throw { status: 401, message: "Invalid password" };
        }

        let setClause: string[] = [];
        const request = pool.request();
        request.input("id", id);

        if (name !== "" && name !== undefined) {
            request.input("name", name);
            setClause.push("name = @name");
        }
        if (address !== "   " && address !== undefined) {
            request.input("address", address);
            setClause.push("address = @address");
        }

        if (setClause.length === 0){
            throw { status: 400, message: "No field to update" };
        }
        const query = `UPDATE users
                SET ${setClause.join(', ')}
                WHERE id = @id`;
        await request.query(query);
    } catch (err : any) {
        throw { status: err.status || 500, message: err.message || "Internal server error" };
    }
}

export const updateInfo = async (user: User): Promise<void> => {
    try {
        let listInfo: string[] = [];
        const pool = await connectionDB();
        const request = pool.request();
        Object.entries(user).forEach(([key, value]) => {
            if (key !== "id" && value !== "" && value !== null && value !== undefined) {
                listInfo.push(`${key} = @${value}`);
                request.input(key, value);
                
           }
        })
        const query = `UPDATE users
            SET ${listInfo.join(', ')}
            WHERE id = @id`
        await request.query(query);
           

    } catch (err : any) {
        throw err;
    }


}

export const changePassword = async (id: number, password: string, newPassword: string): Promise<void> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("id", id)
            .query(`SELECT password FROM users WHERE id = @id`);
    
        if (result.recordset.length === 0) {
            throw { status: 404, message: "User not found" };
        }    
        
        const isMatch = await bcrypt.compare(password, result.recordset[0].password);
        if (!isMatch) {
            throw { status: 401, message: "Invalid current password" };
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await pool.request()
            .input("id", id)
            .input("password", newPasswordHash)
            .query(`UPDATE users
                SET
                password = @password
                WHERE id = @id
                `);
        
    } catch (err : any) {
        throw { status: err.status || 500, message: err.message || "Internal server error" };
    }
}
export const changeEmail = async (id: number, newEmail: string, password: string): Promise<void> => {
    try {
        const pool = await connectionDB();
        const user = await pool.request()
            .input("id", id)
            .query(`SELECT password FROM users WHERE id = @id`);
        if (user.recordset.length === 0) {
            throw { status: 404, message: "User not found" };
        }
        const isMatch = await bcrypt.compare(password, user.recordset[0].password);
        if (!isMatch) {
            throw { status: 401, message: "Invalid password" };
        }
        const checkNewEmail = await pool.request()
            .input("email", newEmail)
            .query(`SELECT email 
                FROM users
                WHERE email = @email
                AND is_verified = 1`);
        if (checkNewEmail.recordset.length >= 1) {
            throw { status: 400, message: "Email already exists" };
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const sent = await utils.sendOtp(newEmail, otp);
        if (!sent) {
            throw { status: 400, message: "Failed to send OTP" };
        }
        await otpService.saveOtp(newEmail, otp);
    } catch (err : any) {
        throw { status: err.status || 500, message: err.message || "Internal server error" };
    }
}
export const verifyChangeEmail = async (id: number, newEmail: string, otp: string) => {
    try {
        const pool = await connectionDB();
        const user = await getUserById(id);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        const result = await otpService.verifyOtp(newEmail, otp);
        if (!result) {
            throw { status: 400, message: "Invalid OTP or expired" };
        }
        await pool.request()
            .input("id", id)
            .input("email", newEmail)
            .query(`UPDATE users
                SET email = @email
                WHERE id = @id`);
    } catch (err: any) {
        throw {status: err.status || 500, message: err.message || "Internal server error"}
    }
}

export const forgotPassword = async (email: string):Promise<void> => {
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const sent = await utils.sendOtp(email, otp);
        if (!sent) {
            throw { status: 401, message: "OTP send failed" };
        }
        otpService.saveOtp(email, otp);
    } catch (err : any) {
        throw {status: err.status || 500, message: err.message || "Internal server error"}
    }
}
export const verifyForgotPasswordOtp = async (email: string, otp: string): Promise<void> => {
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            throw { status: 404, message: "Invalid email" };
        }
        const isMatch = await otpService.verifyOtp(email, otp);
        if (!isMatch) {
            throw { status: 409, message: "Invalid OTP" };
        }
        
    } catch (err : any) {
        throw { status: err.status || 500, message: err.message || "Internal server error" };
    }
}
export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        const pool = await connectionDB();
        await pool.request()
            .input("email", email)
            .input("password", newPasswordHash)
            .query(`UPDATE users SET password = @password
                WHERE email = @email`)
    } catch (err: any) {
        throw { status: err.status || 500, message: err.mesage || "Internal server error" };
    }
}