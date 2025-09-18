import * as crypto from "crypto";
import * as qs from "qs";

export const sortObject = (obj: Record<string, string>) => {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
        sorted[key] = obj[key];
    }
    return sorted;
};

export const buildPaymentUrl = (
    vnp_TmnCode: string,
    vnp_HashSecret: string,
    orderId: string,
    amount: number,
    returnUrl: string
): string => {
    let vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    let vnp_Params: Record<string, string> = {};

    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = vnp_TmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang #" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = (amount * 100).toString(); // nhân 100 theo VNPAY
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = "127.0.0.1";
    vnp_Params["vnp_CreateDate"] = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, "")
        .slice(0, 14);

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    return vnp_Url + "?" + qs.stringify(vnp_Params, { encode: false });
};
