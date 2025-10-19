import axios from 'axios'
import type { Cart } from '../interfaces/cart'

const API_URL = 'http://localhost:3000/api/cart'

export const fetchCartAPI= async(token: string): Promise<Cart> => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (res.data.success) {
    return res.data.data
  } else {
    throw new Error(res.data.message || 'Lỗi khi lấy giỏ hàng')
  }
}

export const removeCartItemAPI = async(cartItemId: number): Promise<void> =>{
    const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvdm5ob2thQGdtYWlsLmNvbSIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE3NjA4NTE2NjgsImV4cCI6MTc2MDg1NTI2OH0.opd_G7ebwtGVUQft-6AmwMlb0ODdWk9-VwS2DBek6D0"
  const res = await axios.delete(`${API_URL}/removeItem/${cartItemId}`,{
    headers:{Authorization:`Bearer ${token}` }
  })
  if (!res.data.success) {
    throw new Error(res.data.message || 'Không thể xoá sản phẩm khỏi giỏ hàng')
  }
}
