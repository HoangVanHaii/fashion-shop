import { connectionDB } from "../config/database";

export const validateVoucher = async (code: string, orderTotal: number, shop_id?: number): Promise<number> => {
  try {
    const pool = await connectionDB();
    const query = `SELECT * FROM vouchers WHERE code = @code`;
    const result = await pool
      .request()
      .input("code", code)
      .query(query);

    if (result.recordset.length === 0) {
      throw { message: "Invalid voucher code", status: 404, errorCode: "VOUCHER_NOT_FOUND" };
    }

    const voucher = result.recordset[0];
    const now = new Date();

    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);

    // if (startDate.getTime() > now.getTime() || endDate.getTime() < now.getTime()) {
    //     throw { message: "Voucher is not valid at this time", status: 400, errorCode: "VOUCHER_EXPIRED" };
    // }
    if (voucher.quantity <= voucher.used) {
      throw { message: "Voucher has been used up", status: 400, errorCode: "VOUCHER_USED_UP" };
    }

    if (orderTotal < voucher.min_order_value) {
      throw { 
        message: `Order total must be at least ${voucher.min_order_value} to use this voucher`, 
        status: 400, 
        errorCode: "ORDER_TOO_SMALL" 
      };
    }

    if (voucher.scope == "SHOP" && voucher.shop_id !== shop_id) {
      throw { message: "Voucher is not valid for this shop", status: 400, errorCode: "VOUCHER_WRONG_SHOP" };
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
    throw error; 
  }
};
