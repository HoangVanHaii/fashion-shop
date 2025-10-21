
export interface ProductSummary {
    id: number;
    name: string;
    shop_id?: number;
    description?: string;
    category_name?: string;
    thumbnail?: string;
    min_price: number;
    max_price: number;
    sold_quantity: number;
    avg_rating: number;
    flash_price?: number;
    images: string[];
}
export interface ProductPayload {
    id?: number,
    shop_id: number;
    shop_name?: string;
    category_id: number;
    category_name?: string;
    name: string;
    description?: string;
    status?: string;
    colors: ProductColor[];
}

export interface ProductColor {
    id?: number,
    product_id?: number,
    color: string,
    image_url: string;
    is_main?: boolean,
    sizes: ProductSize[];
    images: string[];

}
export interface ProductSize {
    product_id: number;
    id?: number;
    size: string;
    stock: number;
    price: number;
    flash_sale_price?: number;
}

