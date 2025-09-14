export interface CartItem{
    id?: number;
    cart_id?: number;
    product_id: number;
    color_id: number;
    size_id: number;
    quantity: number;
}
export interface CartItemDetail{
    id: number;
    product_id: number;
    color_id: number;
    size_id: number;

    name: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
    image_url: string;
    total_price: number;
}
export interface Cart{
    user_id: number;
    items: CartItemDetail[];
    total_quantity: number;
    total_amount: number;
}