export interface ProductSummary {
    id: number;
    name: string;
    shop_id?: number;
    description?: string;
    category_name: string;
    thumbnail?: string;
    min_price: number;
    max_price: number;
    sold_quantity: number;
    avg_rating: number;
    flash_price?: number;
    images: string[];
}