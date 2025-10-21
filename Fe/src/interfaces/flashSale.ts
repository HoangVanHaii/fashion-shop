import type { ProductSummary } from "./product";

export interface FlashSale {
    id?: number;
    title: string;
    start_date: Date;
    end_date: Date;
    status?: 'active' | 'cancelled';  
    created_by: number;
    created_at?: Date;
    Products: ProductSummary[]

}

export interface FlashSaleItem {
    id?: number;
    flash_sale_id?: number;
    product_id?: number;
    product_image?: string;
    product_name?: string;
    original_price?: number;
    flash_sale_price: number;
    stock: number;
    sold?: number;
    status?: 'active' | 'cancelled';
    created_at?: Date;
}
export interface FlashSaleProductSold {
    product_id: number;
    total_flash_sale_sold: number;
  }
  