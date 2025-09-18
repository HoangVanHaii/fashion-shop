import { connectionDB } from "../config/database";
import { User } from "../interfaces/user";
import bcrypt from "bcryptjs";
import * as utils from "../utils/sendOTP";
import * as jwtUtils from "../utils/jwt";
import * as otpService from "../services/otp";
import { AppError } from "../utils/appError";

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const pool = await connectionDB();
    const result = await pool.request()
      .input("email", email)
      .query(`SELECT *
                 FROM users
                 WHERE email = @email AND is_verified = 1`);

    if (result.recordset.length === 0) {
      return null;
    }
    delete result.recordset[0].password
    return result.recordset[0] || null;
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to getUserByEmail", 500, false);
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const pool = await connectionDB();
    const result = await pool.request().input("id", id)
      .query(`SELECT *
                FROM users u
                WHERE u.id = @id`);
    if (result.recordset.length === 0) {
      return null;
    }
    delete result.recordset[0].password
    return result.recordset[0] || null;
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to getUserById", 500, false);
  }
};
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const pool = await connectionDB();
    const result = await pool.request()
      .query(`SELECT id, name, email, role, status, phone, date_of_birth, avatar, is_verified, created_at
         FROM users`);
    return result.recordset as User[];
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to getAllUsers", 500, false);
  }
};

export const searchUser = async (keyword: string): Promise<User[]> => {
  try {
    const pool = await connectionDB();
    const result = await pool.request().input("keyword", `%${keyword}%`)
      .query(`SELECT *
            FROM users
            WHERE (name LIKE @keyword OR email LIKE @keyword OR phone LIKE @keyword)
            AND is_verified = 1`);
    return result.recordset as User[];
  } catch (err: any) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to searchUser", 500, false);
  }
};

export const registerUser = async (user: User): Promise<void> => {
  try {
    const pool = await connectionDB();
    const existingUser = await getUserByEmail(user.email);
    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    await pool
      .request()
      .input("email", user.email)
      .query(`DELETE FROM users WHERE email = @email AND is_verified = 0`);
      const hashedPassword = await bcrypt.hash(user.password!, 10);
    await pool
      .request()
      .input("name", user.name)
      .input("email", user.email)
      .input("phone", user.phone)
      .input("date_of_birth", user.date_of_birth || null)
      .input("avatar", user.avatar)
      .input("password", hashedPassword)
      .input("role", user.role || "customer")
      .query(`INSERT INTO users(name, email, password, role, phone, date_of_birth, avatar)
                    VALUES (@name, @email, @password, @role, @phone, @date_of_birth, @avatar)`);
  } catch (err: any) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to registerUser", 500, false);
  }
};
export const verifyRegisterUser = async (email: string): Promise<void> => {
  try {
    const pool = await connectionDB();
    await pool
      .request()
      .input("email", email)
      .query(`UPDATE users SET is_verified = 1 WHERE email = @email`);
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to verify user", 500, false);
  }
};
export const loginUser = async (email: string, password: string) => {
  try {
    const pool = await connectionDB();
    const result = await pool.request().input("email", email)
      .query(`SELECT u.password, u.id, u.name, u.email, u.avatar, u.role
                FROM users u
                WHERE email = @email AND is_verified = 1`);

    if (result.recordset.length === 0) {
      throw new AppError("User not found", 404);
    }
    if (result.recordset[0].status === "banned") {
      throw new AppError("User is banned", 403);
    }
    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(
      password,
      result.recordset[0].password
    );
    if (!isMatch) {
      throw new AppError("Invalid password", 401);
    }
    delete user.password;

    const accessToken = jwtUtils.accessToken(user.id, user.email, user.role);
    const refreshToken = jwtUtils.refreshToken(user.id, user.email, user.role);

    return {
      user,
      accessToken,
      refreshToken,
    };
  } catch (err: any) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to loginUser", 500, false);
  }
};
export const createUser = async (user: User): Promise<void> => {
  try {
    const pool = await connectionDB();
    const passwordHash = await bcrypt.hash(user.password!, 10);
    await pool.request()
      .input("name", user.name)
      .input("email", user.email)    
      .input("phone", user.phone)
      .input("date_of_birth", user.date_of_birth)
      .input("avatar", user.avatar)
      .input("password", passwordHash)
      .input("role", user.role)
      .input("is_verified", user.is_verified ? 1 : 0)
      .query(`
        INSERT INTO users(name, email, phone, date_of_birth, avatar, password, role, is_verified)
        VALUES(@name, @email, @phone, @date_of_birth, @avatar, @password, @role, @is_verified)               
      `);
    } catch (err : any) {
    console.error(err);
    throw new AppError("Failed to createUser", 500, false);
  }
}

export const updateInfo = async (user: User): Promise<void> => {
  try {
    let listInfo: string[] = [];
    const pool = await connectionDB();
    const request = pool.request();
    Object.entries(user).forEach(([key, value]) => {
      if (
        key !== "id" &&
        key !== "email" &&
        key !== "password" &&
        key != "phone" &&
        value !== "" &&
        value !== null &&
        value !== undefined
      ) {
        listInfo.push(`${key} = @${key}`);
        request.input(key, value);
      }
    });
    request.input("id", user.id);
    const query = `UPDATE users
            SET ${listInfo.join(", ")}
            WHERE id = @id`;
    await request.query(query);
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to updateInfo", 500, false);
  }
};

export const updateAvatar = async (
  id: number,
  avatar: string
): Promise<void> => {
  try {
    const pool = await connectionDB();
    await pool.request().input("id", id).input("avatar", avatar)
      .query(`UPDATE users
        SET avatar = @avatar
        WHERE id = @id`);
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to updateAvatar", 500, false);
  }
};
export const changePhone = async (
  id: number,
  newPhone: string,
  password: string
): Promise<void> => {
  try {
    const pool = await connectionDB();
    const user = await pool
      .request()
      .input("id", id)
      .query(`SELECT password FROM users WHERE id = @id`);
    if (user.recordset.length === 0) {
      throw new AppError("User not found", 404);
    }
    const isMatch = await bcrypt.compare(password, user.recordset[0].password);
    if (!isMatch) {
      throw new AppError("Invalid password", 401);
    }
    const checkNewPhone = await pool.request().input("phone", newPhone)
      .query(`SELECT phone 
                FROM users
                WHERE phone = @phone
                AND is_verified = 1`);
    if (checkNewPhone.recordset.length >= 1) {
      throw new AppError("Phone number already exists", 409);
    }
    await pool.request().input("id", id).input("phone", newPhone)
      .query(`UPDATE users
                SET phone = @phone
                WHERE id = @id`);
  } catch (err: any) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to changePhone", 500, false);
  }
};

export const changePassword = async (
  id: number,
  password: string,
  newPassword: string
): Promise<void> => {
  try {
    const pool = await connectionDB();
    const result = await pool
      .request()
      .input("id", id)
      .query(`SELECT password FROM users WHERE id = @id`);

    if (result.recordset.length === 0) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(
      password,
      result.recordset[0].password
    );
    if (!isMatch) {
      throw new AppError("Invalid current password", 401);
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await pool.request().input("id", id).input("password", newPasswordHash)
      .query(`UPDATE users
                SET
                password = @password
                WHERE id = @id
                `);
  } catch (err: any) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to changePassword", 500, false);
  }
};
export const changeEmail = async (
  id: number,
  newEmail: string,
  password: string
): Promise<void> => {
  try {
    const pool = await connectionDB();
    const user = await pool
      .request()
      .input("id", id)
      .query(`SELECT password FROM users WHERE id = @id`);
    if (user.recordset.length === 0) {
      throw new AppError("User not found", 404);
    }
    const isMatch = await bcrypt.compare(password, user.recordset[0].password);
    if (!isMatch) {
      throw new AppError("Invalid password", 401);
    }
    const checkNewEmail = await pool.request().input("email", newEmail)
      .query(`SELECT email 
                FROM users
                WHERE email = @email
                AND is_verified = 1`);
    if (checkNewEmail.recordset.length >= 1) {
      throw new AppError("Email already exists", 409);
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const subject: string = "Mã OTP xác thực";
    const html: string = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`
    const sent = await utils.sendMail(newEmail, subject, html);
    if (!sent) {
      throw new AppError("Failed to send OTP", 400);
    }
    await otpService.saveOtp(newEmail, otp);
  } catch (err: any) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to changeEmail", 500, false);
  }
};
export const verifyChangeEmail = async (
  id: number,
  newEmail: string,
  otp: string
) => {
  try {
    const pool = await connectionDB();
    const user = await getUserById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const result = await otpService.verifyOtp(newEmail, otp);
    if (!result) {
      throw new AppError("Invalid OTP or expired", 400);
    }
    await pool.request().input("id", id).input("email", newEmail)
      .query(`UPDATE users
                SET email = @email
                WHERE id = @id`);
  } catch (err: any) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to verifyChangeEmail", 500, false);
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const subject: string = "Mã OTP xác thực";
    const html: string = `Mã OTP của bạn là: ${otp}. Mã này sẽ hết hạn sau 5 phút.`
    const sent = await utils.sendMail(email, subject, html);
    if (!sent) {
      throw new AppError("Failed to send OTP", 400);
    }
    otpService.saveOtp(email, otp);
  } catch (err: any) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to send OTP", 500, false);
  }
};
export const verifyForgotPasswordOtp = async (
  email: string,
  otp: string
): Promise<void> => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const isMatch = await otpService.verifyOtp(email, otp);
    if (!isMatch) {
      throw new AppError("Invalid OTP or expired", 400);
    }
  } catch (err: any) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to verifyForgotPasswordOtp", 500, false);
  }
};
export const resetPassword = async (
  email: string,
  newPassword: string
): Promise<void> => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const pool = await connectionDB();
    await pool
      .request()
      .input("email", email)
      .input("password", newPasswordHash)
      .query(`UPDATE users SET password = @password
                WHERE email = @email`);
  } catch (err: any) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to resetPassword", 500, false);
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    const pool = await connectionDB();
    await pool.request().input("id", id).input("status", "banned")
      .query(`UPDATE users
        SET status = @status
        WHERE id = @id`);
  } catch (err) {
    console.error(err);
    throw new AppError("Failed to deleteUser", 500, false);
  }
};

export const unlockUser = async (id: number): Promise<void> => {
  try {
    const checkUser = await getUserById(id);
    if (!checkUser) {
      throw new AppError("User not found", 404);
    }
    const pool = await connectionDB();
    await pool.request().input("id", id).input("status", "active")
      .query(`UPDATE users
        SET status = @status
        WHERE id = @id`);
  } catch (err) {
    console.error(err);
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to unlockUser", 500, false);
  }
};
