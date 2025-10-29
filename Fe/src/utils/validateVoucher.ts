import type { Voucher } from "../interfaces/voucher";
import { getVoucherByIdAPI,getVoucherByCodeAPI } from "../services/voucher";


export const validateVoucherByCode = async (code: string, total: number,shop_id?: number): Promise<number> => {
        
    const result = await getVoucherByCodeAPI(code);
    const voucher:Voucher = result.voucher
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);

    if (startDate.getTime() > now.getTime() || endDate.getTime() < now.getTime()) {
        throw new Error("Voucher is not valid at this time");
    }
    if (voucher.quantity <= (voucher.used || 0)) {
        throw new Error("Voucher is no longer available");
    }
    if (total < voucher.min_order_value) {
        throw new Error(`Order total must be at least ${voucher.min_order_value} to use this voucher`);
    }
    if (voucher.scope == "SHOP" && voucher.shop_id !== shop_id) {
        throw new Error("Voucher is not valid for this shop");
    }

    let discount = 0;
    if (voucher.discount_type === "PERCENT") {
        discount = (total * voucher.discount_value) / 100;
        if (voucher.max_discount && discount > voucher.max_discount) {
            discount = voucher.max_discount;
        }
    } else if (voucher.discount_type === "FIXED") {
        discount = voucher.discount_value;
    }

    return discount;
}

export const validateVoucherById = async (id: number, total: number,shop_id?: number): Promise<number> => {
        
    const voucher:Voucher = await getVoucherByIdAPI(id);
    console.log(voucher)
    const now = new Date();
    const startDate = new Date(voucher.start_date);
    const endDate = new Date(voucher.end_date);

    if (startDate.getTime() > now.getTime() || endDate.getTime() < now.getTime()) {
        throw new Error("Voucher is not valid at this time");
    }
    if (voucher.quantity <= (voucher.used || 0)) {
        throw new Error("Voucher is no longer available");
    }
    if (total < voucher.min_order_value) {
        throw new Error(`Order total must be at least ${voucher.min_order_value} to use this voucher`);
    }
    if (voucher.scope == "SHOP" && voucher.shop_id !== shop_id) {
        throw new Error("Voucher is not valid for this shop");
    }

    let discount = 0;
    if (voucher.discount_type === "PERCENT") {
        console.log("da chay PERCENT ")
        discount = (total * voucher.discount_value) / 100;
        if (voucher.max_discount && discount > voucher.max_discount) {
            discount = voucher.max_discount;
        }
    } else if (voucher.discount_type === "FIXED") {
        console.log("da chay FIXED ")
        discount = voucher.discount_value;
    }
    console.log("gia sau khi tinh")
    console.log(discount)
    return discount;
}
