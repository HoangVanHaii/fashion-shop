import axios from "axios";
export const getTop4Voucher = async (top: number, scope: string) => {
    const result = await axios.get(`http://localhost:3000/api/voucher/topVoucher?top=${top}&scope=${scope}`);
    return result.data;
}
export const getAllVoucher = async () => {
    const result = await axios.get(`http://localhost:3000/api/voucher/`);
    return result.data;
}
export const getVoucherByCode = async (code: string) => {
    const result = await axios.get(`http://localhost:3000/api/voucher/getVoucherByCode/${code}`)
    return result.data;

}
export const getVoucherById = async (id: number) => {
    const result = await axios.get(`http://localhost:3000/api/voucher/getVoucherById/:${id}`)
    return result.data;
}