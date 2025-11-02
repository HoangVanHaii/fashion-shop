export interface FlashSale {
    id?: number;
    title: string;
    start_date: Date;
    end_date: Date;
    status?: string;  
    created_by: number;
    created_at?: Date;
    shop_has_sale?: boolean;
    items?: FlashSaleItem[];
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
    status?: string;
    created_at?: Date;
    ImageProducts?: ImageProducts[];
}
export interface ImageProducts {
    color_id: number;
    image_url: string;
}
export interface FlashSaleProductSold {
    product_id: number;
    total_flash_sale_sold: number;
    total_stock: number;
  }
  