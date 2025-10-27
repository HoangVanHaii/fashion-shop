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
  const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvdm5ob2thQGdtYWlsLmNvbSIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE3NjE0NjUxMjUsImV4cCI6MTc2MTQ2ODcyNX0.1kxge-yhOtB790WLlfPi1ZOQ5ry_u4EuPiZ6P_EhE3E"
  const res = await axios.delete(`${API_URL}/removeItem/${cartItemId}`,{
    headers:{Authorization:`Bearer ${token}` }
  })
  if (!res.data.success) {
    throw new Error(res.data.message || 'Không thể xoá sản phẩm khỏi giỏ hàng')
  }
}

export const updateSizeCartItemAPI = async (cart_item_id: number, size_id: number): Promise<void> => {
  const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvdm5ob2thQGdtYWlsLmNvbSIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE3NjE0NzU0OTgsImV4cCI6MTc2MTQ3OTA5OH0.pS8RpMLhLS9xew5JidAaK7wTlwFzMlXYfOXqm6nFQ8c"
  const res = await axios.put(`${API_URL}/updateItem/${cart_item_id}`, 
    { size_id },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || 'Không thể cập nhật sản phẩm trong giỏ hàng');
  }
};

export const updateCartItemQuantityAPI = async (cart_item_id: number, newQuantity: number): Promise<void> => {
  const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvdm5ob2thQGdtYWlsLmNvbSIsInJvbGUiOiJzZWxsZXIiLCJpYXQiOjE3NjE0NjUxMjUsImV4cCI6MTc2MTQ2ODcyNX0.1kxge-yhOtB790WLlfPi1ZOQ5ry_u4EuPiZ6P_EhE3E"
  const res = await axios.put(`${API_URL}/updateItemQuantity/${cart_item_id}`, 
    { quantity: newQuantity },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || 'Không thể cập nhật sản phẩm trong giỏ hàng');
  }
};

