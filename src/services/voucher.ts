import { connectionDB } from "../config/database";
import { AppError } from "../utils/appError";
import { Voucher } from "../interfaces/voucher";

export const createVoucher = async (voucher: Voucher): Promise<number> => {
	try {
		const pool = await connectionDB();
		const query = `INSERT INTO vouchers (code, description, discount_type, discount_value, max_discount, min_order_value, quantity, start_date, end_date,created_by, scope, shop_id, image_url)
					   OUTPUT INSERTED.id AS voucherId
					   VALUES (@code, @description, @discount_type, @discount_value, @max_discount, @min_order_value, @quantity, @start_date, @end_date, @created_by, @scope, @shop_id, @image_url)`;
		const result = await pool
			.request()
			.input("code", voucher.code)
			.input("description", voucher.description)
			.input("discount_type", voucher.discount_type)
			.input("discount_value", voucher.discount_value)
			.input("max_discount", voucher.max_discount)
			.input("min_order_value", voucher.min_order_value)
			.input("quantity", voucher.quantity)
			.input("start_date", voucher.start_date)
			.input("end_date", voucher.end_date)
			.input("created_by", voucher.created_by)
			.input("scope", voucher.scope)
			.input("shop_id", voucher.shop_id)
			.input("image_url", voucher.image_url)
			.query(query);

		return result.recordset[0].voucherId;
	} catch (error) {
		console.error(error);
		throw new AppError('Failed to create voucher', 500, false);
	}
}
export const updateVoucher = async (voucher: Voucher): Promise<void> => {
	try {
		const pool = await connectionDB();
		const request = pool.request();
		let updates: string[] = [];
		Object.entries(voucher).forEach(([key, value]) => {
			if (key !== "id" && value !== undefined) {
				updates.push(`${key} = @${key}`);
				request.input(key, value);
			}
		});
		if (updates.length === 0) {
			throw new AppError("No fields to update", 400);
		}
		request.input("id", voucher.id);
		const query = `UPDATE vouchers
					   SET ${updates.join(", ")}
					   WHERE id = @id`;
		await request.query(query);
	} catch (error) {
		throw new AppError('Failed to update voucher', 500, false);
	}
}
export const getVoucherCodeById = async (voucher_id: number): Promise<string | null> => {
	try {
		const pool = await connectionDB();
		const query = `SELECT code FROM vouchers WHERE id = @voucher_id`;
		const result = await pool
			.request()
			.input("voucher_id", voucher_id)
			.query(query);

		if (result.recordset.length === 0) {
			return null;
		}
		return result.recordset[0].code;
	} catch (error: any) {
		throw new AppError('Failed to fetch voucher code', 500, false);
	}
}
export const getVoucherByCode = async (code: string): Promise<Voucher| null> => {
	try {
		const pool = await connectionDB();
		const query = `SELECT * FROM vouchers WHERE code = @code`;
		const result = await pool
			.request()
			.input("code", code)
			.query(query);

		if (result.recordset.length === 0) {
			return null;
		}
		return result.recordset[0] as Voucher;
	} catch (error: any) {
		throw new AppError('Failed to fetch voucher by code', 500, false);
	}
}
export const validateVoucher = async (code: string, orderTotal: number, shop_id?: number): Promise<number> => {
	try {
		const pool = await connectionDB();
		const query = `SELECT * FROM vouchers WHERE code = @code`;
		const result = await pool
			.request()
			.input("code", code)
			.query(query);

		if (result.recordset.length === 0) {
			throw  new AppError("Voucher not found", 404);
		}

		const voucher = result.recordset[0];
		const now = new Date();

		const startDate = new Date(voucher.start_date);
		const endDate = new Date(voucher.end_date);

		if (startDate.getTime() > now.getTime() || endDate.getTime() < now.getTime()) {
			throw new AppError("Voucher is not valid at this time", 400);
		}
		if (voucher.quantity <= voucher.used) {
			throw new AppError("Voucher is no longer available", 400);
		}
		if (orderTotal < voucher.min_order_value) {
			throw new AppError(`Order total must be at least ${voucher.min_order_value} to use this voucher`, 400);
		}
		if (voucher.scope == "SHOP" && voucher.shop_id !== shop_id) {
			throw new AppError("Voucher is not valid for this shop", 400);
		}

		let discount = 0;
		if (voucher.discount_type === "PERCENT") {
			discount = (orderTotal * voucher.discount_value) / 100;
			if (voucher.max_discount && discount > voucher.max_discount) {
				discount = voucher.max_discount;
			}
		} else if (voucher.discount_type === "FIXED") {
			discount = voucher.discount_value;
		}

		return discount;
	} catch (error: any) {
		if (error instanceof AppError) {
			throw error;
		}
		throw new AppError('Failed to validate voucher', 500, false);
	}
};

export const getAllVouchers = async (): Promise<Voucher[]> => {
	try {
		const pool = await connectionDB();
		const query = `SELECT * FROM vouchers`;
		const result = await pool.request().query(query);
		return result.recordset as Voucher[];
	} catch (error) {
		throw new AppError('Failed to fetch vouchers', 500, false);
	}
}
export const getVoucherById = async (id: number): Promise<Voucher | null> => {
	try {
		const pool = await connectionDB();
		const query = `SELECT * FROM vouchers WHERE id = @id`;
		const result = await pool.request().input("id", id).query(query);
		if (result.recordset.length === 0) {
			return null;
		}
		return result.recordset[0] as Voucher;
	} catch (error) {
		throw new AppError('Failed to fetch voucher by id', 500, false);
	}
}
export const getVoucherByShopId = async (shop_id: number): Promise<Voucher[]> => {
	try {
		const pool = await connectionDB();
		const query = `SELECT * FROM vouchers WHERE shop_id = @shop_id`;
		const result = await pool.request().input("shop_id", shop_id).query(query);
		return result.recordset as Voucher[];
	} catch (error) {
		throw new AppError('Failed to fetch vouchers by shop id', 500, false);
	}
}
