import { connectionDB } from "../config/database";
import { reviewImages, reviewsDetail, ReviewSummary, SellerRequest, User } from "../interfaces/user";
import bcrypt from "bcryptjs";
import * as utils from "../utils/sendOTP";
import * as jwtUtils from "../utils/token";
import * as otpService from "../services/otp";
import { AppError } from "../utils/appError";
import { Shop, ShopVisit, ShopDetal, ShopToDoSummary, ShopStatistic } from "../interfaces/user";
import fs from "fs"
import path from "path"
import mssql, { pool } from 'mssql'

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

export const getNameById = async (id: number): Promise<User | null> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request().input("id", id)
            .query(`SELECT name
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
export const getAllUsers = async (role?: string, status?: string, is_verified?: string): Promise<User[]> => {
    try {
        let query = "SELECT * FROM users WHERE 1=1";
        if (role) {
            query += ` AND role = '${role}'`;
        }
        if (status) {
            query += ` AND status = '${status}'`;
        }
        if (is_verified) {
            query += ` AND is_verified = '${is_verified === "true" ? 1 : 0}'`;
        }
        const pool = await connectionDB();
        const result = await pool.request().query(query);
        return result.recordset as User[];

    } catch (err) {
        console.error(err);
        throw new AppError("Failed to getAllUsers", 500, false);
    }
};
export const getAllSellerRequest = async (): Promise<SellerRequest[]> => {
    try {
        let query = "SELECT * FROM seller_requests";
        const pool = await connectionDB();
        const result = await pool.request().query(query);
        return result.recordset as SellerRequest[];

    } catch (err) {
        console.error(err);
        throw new AppError("Failed to getAllSellerRequest", 500, false);
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
        if (err instanceof AppError) throw err;
        console.error(err);
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
            .input("gender", user.gender || "other")
            .query(`INSERT INTO users(name, email, password, role, phone, date_of_birth, gender, avatar)
                    VALUES (@name, @email, @password, @role, @phone, @date_of_birth, @gender, @avatar)`);
    } catch (err) {
        if (err instanceof AppError) throw err;
        console.error(err);
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
        if (err instanceof AppError) throw err;
        console.error(err);
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
            .input("gender", user.gender)
            .query(`
        INSERT INTO users(name, email, phone, date_of_birth, gender, avatar, password, role, is_verified)
        VALUES(@name, @email, @phone, @date_of_birth, @gender, @avatar, @password, @role, @is_verified)               
      `);
    } catch (err: any) {
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
                value !== "" &&
                value !== null &&
                value !== undefined
            ) {
                listInfo.push(`${key} = @${key}`);
                request.input(key, value);
            }
        }); request.input("id", user.id);
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
        const user = await getUserById(id);

        await pool.request().input("id", id).input("avatar", avatar)
            .query(`UPDATE users
        SET avatar = @avatar
        WHERE id = @id`);

        const oldAvatar = user?.avatar || "";
        if (oldAvatar != "" && oldAvatar !== "/uploads/users/default-avatar.png") {
            const oldFileName = path.basename(oldAvatar);
            const oldFilePath = path.join(process.cwd(), "uploads", "users", oldFileName)
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

    } catch (err) {
        console.error(err);
        throw new AppError("Failed to updateAvatar", 500, false);
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
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to changePassword", 500, false);
    }
};
export const getShopnameByProduct_id = async (product_id: number): Promise<string> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("product_id", product_id)
            .query(`
                SELECT s.name AS shop_name
                FROM products p
                JOIN shops s ON s.id = p.shop_id
                WHERE p.id = @product_id
            `);

        if (result.recordset.length === 0) {
            throw new AppError("Shop not found for this product", 404);
        }

        return result.recordset[0].shop_name || "";
    } catch (err: any) {
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to getShopnameByProduct_id", 500, false);
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
        if (err instanceof AppError) throw err;
        console.error(err);
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
        if (err instanceof AppError) throw err;
        console.error(err);
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
        if (err instanceof AppError) throw err;
        console.error(err);
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
        if (err instanceof AppError) throw err;
        console.error(err);
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
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to unlockUser", 500, false);
    }
};


//////////////////////////////////////////////////////////


export const createRequestSeller = async (sellerRequest: SellerRequest): Promise<void> => {
    try {
        const pool = await connectionDB();
        await pool.request()
            .input("user_id", sellerRequest.user_id)
            .input("name", sellerRequest.name)
            .input("phone", sellerRequest.phone)
            .input("address", sellerRequest.address)
            .input("email", sellerRequest.email)
            .input("cccd", sellerRequest.cccd)
            .input("description", sellerRequest.description)
            .input("status", sellerRequest.status || "pending")
            .query(`INSERT INTO seller_requests
          (user_id, name, phone, address, email, cccd, description, status) 
          VALUES(@user_id, @name, @phone, @address, @email, @cccd, @description, @status)
          `)

        const { subject, html } = getSellerRequestEmailContent("pending", sellerRequest.name);
        await utils.sendMail(sellerRequest.email, subject, html);
    } catch (err) {
        console.error(err);
        throw new AppError("Failed to createRequestSeller", 500, false);
    }
}
export const checkSellerRequestByUserId = async (user_id: number): Promise<void> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("user_id", user_id)
            .query(`SELECT status FROM seller_requests WHERE user_id = @user_id`)
        if (result.recordset.length > 0) {
            const status = result.recordset[0].status;
            if (status === "pending") {
                throw new AppError("You already have a pending seller request.", 400);
            }
            if (status === "approved") {
                throw new AppError("You are already a verified seller.", 400);
            }
        }

    } catch (err) {
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to checkSellerRequestByUserId", 500, false);
    }
}

export const respondSellerRequest = async (id: number, status: string): Promise<void> => {
    const pool = await connectionDB();
    const transaction = new mssql.Transaction(pool);
    try {
        await transaction.begin();

        const checkRequestSeller = await transaction.request()
            .input("id", id)
            .query(`select * FROM seller_requests WHERE id = @id`)
        if (checkRequestSeller.recordset.length === 0) {
            throw new AppError("SellerRequest not found", 404);
        }
        if (checkRequestSeller.recordset[0].status === status) {
            throw new AppError(`The seller request is already ${status}.`, 409);
        }
        await transaction.request()
            .input("id", id)
            .input("status", status)
            .query(`UPDATE seller_requests SET status = @status WHERE id = @id`)
        const sellerRequest: SellerRequest = checkRequestSeller.recordset[0];

        if (status === "approved") {
            await createShopFromSellerRequest(sellerRequest, transaction);
            await updateRoleById(id, transaction);
        }

        await transaction.commit();

        const { subject, html } = getSellerRequestEmailContent(status, checkRequestSeller.recordset[0].name);
        await utils.sendMail(checkRequestSeller.recordset[0].email, subject, html);



    } catch (err) {
        await transaction.rollback();
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to respondSellerRequest", 500, false);
    }
}
export const updateRoleById = async (seller_request_id: number, transaction: mssql.Transaction): Promise<void> => {
    try {
        const request = new mssql.Request(transaction);
        await request
            .input("id", seller_request_id)
            .query(`UPDATE u
                SET u.role = 'seller'
                FROM seller_requests sr
                JOIN users u ON u.id = sr.user_id
              WHERE sr.id = @id`)
    } catch (err) {
        console.error(err);
        throw new AppError("Failed to respondSellerRequest", 500, false);

    }
}

export const createShopFromSellerRequest = async (sellerRequest: SellerRequest, transaction: mssql.Transaction): Promise<void> => {
    try {
        const request = new mssql.Request(transaction);
        await request
            .input("seller_id", sellerRequest.user_id)
            .input("name", sellerRequest.name)
            .input("phone", sellerRequest.phone)
            .input("email", sellerRequest.email)
            .input("address", sellerRequest.address)
            .input("cccd", sellerRequest.cccd)
            .input("description", sellerRequest.description)
            .input("logo", "/uploads/shops/default-logo.jpg")
            .query(`INSERT INTO shops 
          (seller_id, name, phone, address, email, cccd, description, logo)
        VALUES(@seller_id, @name, @phone, @address, @email, @cccd, @description, @logo)
        `)
    } catch (err) {
        console.error(err);
        throw new AppError("Failed to createShopFromSellerRequest", 500, false)
    }
}
export const getSellerRequestEmailContent = (status: string, shopName: string) => {
    let subject = "";
    let html = "";

    if (status === "approved") {
        subject = "Chúc mừng! Yêu cầu trở thành Seller đã được duyệt 🎉";
        html =
            "Xin chào,\n\n" +
            "Yêu cầu trở thành người bán hàng của bạn \"" + shopName + "\" đã được chấp thuận.\n" +
            "Bạn có thể đăng nhập để bắt đầu quản lý cửa hàng của mình ngay.\n\n" +
            "Trân trọng,\nĐội ngũ hỗ trợ Fashion Shop";
    }
    else if (status === "rejected") {
        subject = "Rất tiếc! Yêu cầu trở thành Seller bị từ chối ❌";
        html =
            "Xin chào,\n\n" +
            "Rất tiếc, yêu cầu trở thành người bán hàng của bạn \"" + shopName + "\" đã bị từ chối.\n" +
            "Bạn có thể gửi lại yêu cầu sau khi cập nhật thông tin hợp lệ.\n\n" +
            "Trân trọng,\nĐội ngũ hỗ trợ Fashion Shop";
    }
    else {
        subject = "Thông báo về yêu cầu trở thành Seller";
        html =
            "Xin chào,\n\n" +
            "Yêu cầu của bạn về việc trở thành người bán hàng đang được xử lý.\n" +
            "Chúng tôi sẽ gửi thông báo khi có kết quả.\n\n" +
            "Trân trọng,\nĐội ngũ hỗ trợ Fashion Shop";
    }

    return { subject, html };
};

export const recordShopVisit = async (shop_id: number, ip_address: string): Promise<void> => {
    try {
        const checkShop = await getShopById(shop_id);
        if (!checkShop) {
            throw new AppError("ShopId not found", 404);
        }
        const pool = await connectionDB();
        const shopVisit = await getShopVisitByShopIdAndIP(shop_id, ip_address);
        const today = new Date().toISOString().split('T')[0];
        const todaySql = shopVisit?.visit_date.toISOString().split('T')[0];
        if (!shopVisit) {
            await pool.request()
                .input("shop_id", shop_id)
                .input("ip_address", ip_address)
                .input("visit_date", today)
                .query(`INSERT INTO shop_visits (shop_id, ip_address, visit_date)
          VALUES(@shop_id, @ip_address, @visit_date)
          `)
        }
        else if (today !== todaySql) {
            await pool.request()
                .input("shop_id", shop_id)
                .input("ip", ip_address)
                .input("visit_count", shopVisit.visit_count + 1)
                .input("visit_date", today)
                .query(`UPDATE shop_visits
          SET visit_count = @visit_count, visit_date = @visit_date
          WHERE shop_id = @shop_id AND ip_address = @ip
        `)
        }
    } catch (err) {
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to recordShopVisit", 500, false);

    }
}
export const getShopVisitByShopIdAndIP = async (shop_id: number, ip_address: string): Promise<ShopVisit | null> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("shop_id", shop_id)
            .input("ip", ip_address)
            .query(`SELECT * FROM shop_visits
        WHERE shop_id = @shop_id AND ip_address = @ip
        `)
        const shopVisit: ShopVisit = result.recordset[0] || null;
        return shopVisit;
    } catch (err) {
        console.error(err);
        throw new AppError("Failed to getShopVisitByShopIdAndIP", 500, false);
    }
}

export const getShopById = async (shop_id: number): Promise<Shop | null> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("shop_id", shop_id)
            .query(`SELECT *  FROM shops WHERE id = @shop_id`)
        const shop: Shop = result.recordset[0];
        return shop;

    } catch (err) {
        console.error(err);
        throw new AppError("Failed to getShopById", 500, false);
    }
}

export const getShopDetailById = async (shop_id: number, ip_address: string): Promise<ShopDetal> => {
    try {
        const shop = await getShopById(shop_id);
        if (!shop) {
            throw new AppError("Shop not found", 404);
        }

        await recordShopVisit(shop_id, ip_address);
        const avg_rating = await getShopRating(shop_id);
        const total_visits = await getTotalShopVisits(shop_id);
        const shopDetal: ShopDetal = {
            id: shop_id,
            shop_name: shop.name,
            logo: shop.logo || "",
            description: shop.description || "",
            address: shop.address || "",
            rating: avg_rating,
            visit_count: total_visits,
            created_at: shop.created_at
        }
        return shopDetal;
    } catch (err) {
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to getShopDetailById", 500, false);
    }
}
export const getShopRating = async (shop_id: number): Promise<number> => {
    try {
        const pool = await connectionDB();
        const result = await pool.request()
            .input("shop_id", shop_id)
            .query(`SELECT AVG(r.rating) as avg_rating
          FROM reviews r
            JOIN order_items oi ON r.order_item_id = oi.id
            JOIN product_sizes ps ON ps.id = oi.size_id
            JOIN product_colors pc ON pc.id = ps.color_id
            JOIN products p ON p.id = pc.product_id
          WHERE p.shop_id = @shop_id
        `)
        const avg_rating = result.recordset[0].avg_rating
        return avg_rating || 0;

    } catch (err) {
        console.error(err);
        throw new AppError("Failed to getShopRating", 500, false);
    }
}

export const getTotalShopVisits = async (shop_id: number): Promise<number> => {
    const pool = await connectionDB();
    const result = await pool.request()
        .input("shop_id", shop_id)
        .query(`
      SELECT SUM(visit_count) AS total_visits
      FROM shop_visits
      WHERE shop_id = @shop_id
    `);
    return result.recordset[0]?.total_visits || 0;
};
export const changeLogo = async (shop_id: number, logo: string): Promise<void> => {
    try {
        const checkShop = await getShopById(shop_id);
        if (!checkShop) {
            throw new AppError("Shop not found", 404);
        }
        const pool = await connectionDB();
        const oldLogo = await getLogo(shop_id);
        await pool.request()
            .input("id", shop_id)
            .input("logo", logo)
            .query(`UPDATE shops
          SET logo = @logo
          WHERE id = @id        
        `)
        if (oldLogo !== "" && oldLogo != "/uploads/shops/default-logo.jpg") {
            const oldFileName = path.basename(oldLogo);
            const oldFilePath = path.join(process.cwd(), "uploads", "shops", oldFileName)
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }
    } catch (err) {
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to changeLogo", 500, false);
    }
}
export const getLogo = async (shop_id: number): Promise<string> => {
    const pool = await connectionDB();
    const logoString = await pool.request()
        .input("id", shop_id)
        .query(`SELECT logo FROM shops WHERE id = @id`)
    return logoString.recordset[0].logo || ""
}

export const getShopTodoSummary = async (shop_id: number): Promise<ShopToDoSummary> => {
    try {
        const checkShop = await getShopById(shop_id);
        if (!checkShop) {
            throw new AppError("Shop not fount", 404);
        }
        const pendingOrderCount = await getOrderStatusCount(shop_id, "pending");
        const confirmedOrderCount = await getOrderStatusCount(shop_id, "confirmed");
        const cancelledOrderCount = await getOrderStatusCount(shop_id, "cancelled");
        const bannedProductCount = await getProductBannedCount(shop_id);
        const totoSummary: ShopToDoSummary = { shop_id, pendingOrderCount, confirmedOrderCount, cancelledOrderCount, bannedProductCount }
        return totoSummary;
    } catch (err) {
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to getShopToDoSummary", 500, false);
    }
}
export const getOrderStatusCount = async (shop_id: number, status: string): Promise<number> => {
    const pool = await connectionDB();
    const result = await pool.request()
        .input("id", shop_id)
        .input("status", status)
        .query(`
      SELECT COUNT(*) AS count_order
        FROM (
          SELECT o.id
          FROM order_items oi
            JOIN orders o ON o.id = oi.order_id AND o.status = @status
            JOIN product_sizes ps ON oi.size_id = ps.id
            JOIN product_colors pc ON pc.id = ps.color_id
            JOIN products p ON p.id = pc.product_id
          WHERE p.shop_id = @id
          GROUP BY o.id
        ) AS sub`);
    return result.recordset[0].count_order || 0;
}
export const getProductBannedCount = async (shop_id: number): Promise<number> => {
    const pool = await connectionDB();
    const result = await pool.request()
        .input("id", shop_id)
        .input("status", "banned")
        .query(`SELECT COUNT(id) AS count_product FROM products WHERE shop_id = @id AND status = @status`)
    return result.recordset[0].count_product || 0;
}

export const getShopStatistic = async (shop_id: number): Promise<ShopStatistic> => {
    try {
        const checkShop = await getShopById(shop_id);
        if (!checkShop) {
            throw new AppError("Shop not fount", 404);
        }
        const totalRevenue = await getShopRevenue(shop_id);
        const totalOrder = await getShopOrderCount(shop_id);
        const totalVisit = await getTotalShopVisits(shop_id);
        const shopStatistic: ShopStatistic = { shop_id, totalRevenue, totalVisit, totalOrder };
        return shopStatistic;
    } catch (err) {
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to getShopToDoSummary", 500, false);
    }
}

export const getShopRevenue = async (shop_id: number): Promise<number> => {
    const pool = await connectionDB();
    const result = await pool.request()
        .input("id", shop_id)
        .query(`
      SELECT SUM(o.total + ISNULL(o.discount_value, 0)) as totalPrice
      FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN product_sizes ps ON ps.id = oi.size_id
        JOIN product_colors pc ON pc.id = ps.color_id
        JOIN products p ON p.id = pc.product_id
        WHERE p.shop_id = @id
      `)
    return result.recordset[0].totalPrice || 0;
}
export const getShopOrderCount = async (shop_id: number): Promise<number> => {
    const pool = await connectionDB();
    const result = await pool.request()
        .input("id", shop_id)
        .query(`SELECT COUNT(*) AS totalOrder
        FROM (SELECT o.id
              FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                JOIN product_sizes ps ON ps.id = oi.size_id
                JOIN product_colors pc ON pc.id = ps.color_id
                JOIN products p ON p.id = pc.product_id
            WHERE p.shop_id = @id
          GROUP BY o.id
        ) AS tmp
      `)
    return result.recordset[0].totalOrder || 0;
}
export const getShopReviewSummary = async (shop_id: number): Promise<ReviewSummary> => {
    try {
        const checkShop = await getShopById(shop_id);
        if (!checkShop) {
            throw new AppError("Shop not fount", 404);
        }
        const totalReviewCount = await getReviewRatingCount(shop_id, "1, 2, 3, 4, 5");
        const positiveReviewRate = await getReviewRatingCount(shop_id, "3, 4, 5");
        const negativeReviewCount = await getReviewRatingCount(shop_id, "1, 2");
        const recentReviewCount = await getRecentReviewCount(shop_id);

        const reviewSummary: ReviewSummary = {
            totalReviewCount,
            positiveReviewRate: totalReviewCount ? positiveReviewRate / totalReviewCount : 0,
            negativeReviewCount,
            recentReviewCount
        }
        return reviewSummary;
    } catch (err) {
        if (err instanceof AppError) throw err;
        console.error(err);
        throw new AppError("Failed to getShopToDoSummary", 500, false);
    }
}

export const getRecentReviewCount = async (shop_id: number): Promise<number> => {
    const pool = await connectionDB();
    const result = await pool.request()
        .input("id", shop_id)
        .query(`SELECT COUNT(r.id) AS count_review
      FROM reviews r
        JOIN order_items oi ON oi.id = r.order_item_id
        JOIN product_sizes ps ON ps.id = oi.size_id
        JOIN product_colors pc ON pc.id = ps.color_id
        JOIN products p ON p.id = pc.product_id
      WHERE p.shop_id = @id
        AND r.created_at BETWEEN DATEADD(DAY, -5, GETDATE()) AND GETDATE();
    `)
    return result.recordset[0].count_review || 0

}

export const getReviewRatingCount = async (shop_id: number, ratings: string): Promise<number> => {
    const pool = await connectionDB();
    const ratingList = ratings.split(',').map(r => parseInt(r.trim()));
    const result = await pool.request()
        .input("id", shop_id)
        .query(`SELECT COUNT(r.id) AS count_review
      FROM reviews r
        JOIN order_items oi ON oi.id = r.order_item_id
        JOIN product_sizes ps ON ps.id = oi.size_id
        JOIN product_colors pc ON pc.id = ps.color_id
        JOIN products p ON p.id = pc.product_id
      WHERE p.shop_id = @id AND r.Rating IN (${ratingList.join(',')})
    `)
    return result.recordset[0].count_review || 0
}

export const getReviewRatingDetail = async (shop_id: number, ratings: string): Promise<reviewsDetail[]> => {
    const pool = await connectionDB();

    const ratingList = ratings.split(',').map(r => parseInt(r.trim()));

    const query = `
    SELECT r.id, p.name AS product_name, pc.image_url AS product_image, 
           ps.size AS product_size, oi.quantity, r.rating, r.comment
    FROM reviews r
      JOIN order_items oi ON oi.id = r.order_item_id
      JOIN product_sizes ps ON ps.id = oi.size_id
      JOIN product_colors pc ON pc.id = ps.color_id
      JOIN products p ON p.id = pc.product_id
    WHERE p.shop_id = @shop_id AND r.rating IN (${ratingList.join(',')})
  `;

    const result = await pool.request()
        .input("shop_id", shop_id)
        .query(query);

    const reviews = result.recordset;

    const detailedReviews: reviewsDetail[] = [];
    for (const r of reviews) {
        const reviewImage = await getReviewImage(r.id);
        detailedReviews.push({
            id: r.id,
            product_name: r.product_name,
            product_image: r.product_image,
            product_size: r.product_size,
            quantity: r.quantity,
            rating: r.rating,
            comment: r.comment,
            reviewImage: reviewImage
        });
    }
    return detailedReviews;
};

export const getReviewImage = async (review_id: number): Promise<reviewImages[]> => {
    const pool = await connectionDB();
    const result = await pool.request()
        .input("id", review_id)
        .query(`SELECT id, image_url FROM review_images WHERE review_id = @id`);

    const images: reviewImages[] = result.recordset.map(element => ({
        id: element.id,
        image_url: element.image_url
    }));

    return images;
};

export const getShopIdByUserId = async (user_id: number): Promise<number> => {
    try {
        const pool = await connectionDB();
        const result = await pool
            .request()
            .input("user_id", user_id)
            .query(`SELECT id FROM shops WHERE seller_id = @user_id`);
        if (result.recordset.length === 0) {
            throw new AppError("Shop not found for this user", 404);
        }
        return result.recordset[0].id;
    } catch (err: any) {
        console.error(err);
        throw new AppError("Failed to getShopIdByUserId", 500, false);
    }
};