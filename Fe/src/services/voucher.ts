import axios from "axios";
import type { Voucher } from "../interfaces/voucher"

const API_URL = 'http://localhost:3000/api/voucher'

export const getVoucherByIdAPI = async (id:number): Promise<Voucher> =>{
    const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvdm5ob2thQGdtYWlsLmNvbSIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE3NjE1MjcxNDIsImV4cCI6MTc2MTUzMDc0Mn0.ew1U0qKpkVw4Y35nznF0m0Va_U8NfXZ7A-5UWwn_YS8"
    const res = await axios.get(`${API_URL}/getVoucherById/${id}`,
        {headers:{Authorization:`Bearer ${token}`}}
    )
    const voucher = res.data.voucher
    if(!voucher){
        throw new Error('Voucher not found');
    }
    return voucher
}

export const getVoucherByCodeAPI = async (code:string): Promise<Voucher> =>{
    const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvdm5ob2thQGdtYWlsLmNvbSIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE3NjE0OTgyNjEsImV4cCI6MTc2MTUwMTg2MX0.4dO2wBuXvdKddAZAxlqihGdzsfEh_br_Ed9HhNK2hX4"
    const res = await axios.get(`${API_URL}/getVoucherByCode/${code}`,
        {headers:{Authorization:`Bearer ${token}`}}
    )
    const voucher = res.data.voucher
    if(!voucher){
        throw new Error('Voucher not found');
    }
    return voucher
}