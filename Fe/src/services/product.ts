import axios from 'axios'
import type { ProductPayload,ProductSize } from '../interfaces/product.ts'

const API_URL = 'http://localhost:3000/api/product'

export const getProductIdBySize = async (sizeId: number): Promise<number> => {
  const res = await axios.get(`${API_URL}/id-by-size/${sizeId}`);
  if (res.data && typeof res.data.product_id === 'number') {
    return res.data.product_id;
  }
  throw new Error(res.data?.message || 'Lỗi khi lấy product_id từ size_id');
}


export const getProductById = async (productId: number): Promise<ProductPayload> => {
  const res = await axios.get(`${API_URL}/${productId}`);
  const product = res.data;
  if (!product) {
    throw new Error('Sản phẩm không tồn tại');
  }
  return product;
}

export const getProductSizesBySizeId = async (size_id: number): Promise<ProductSize> =>{
  const res = await axios.get(`${API_URL}/size-detail/${size_id}`);
  const product_size = res.data;
  if(!product_size) {
    throw new Error('Size không tồn tại');
  }
  return product_size;
}
