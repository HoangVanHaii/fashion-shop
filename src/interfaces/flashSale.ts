export interface FlashSale {
    id?: number;
    title: string;
    start_date: Date;
    end_date: Date;
    status?: 'active'| 'active' | 'ended' | 'cancelled';  
    created_by: number;
    created_at?: Date;
    items?: FlashSaleItem[];
}
export interface FlashSaleItem {
    id?: number;
    product_id?: number;
    flash_sale_id?: number;
    size_id?: number;
    product_image?: string;
    product_name?: string;
    original_price?: number;
    flash_sale_price: number;
    stock: number;
    sold?: number;
    status?: 'active' | 'sold_out' | 'removed';
    created_at?: Date;
}
