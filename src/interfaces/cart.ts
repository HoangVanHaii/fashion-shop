export interface CartItem{
    cart_item_id?: number;
    cart_id?: number;
    product_id: number;
    color_id: number;
    size_id: number;
    quantity: number;
}
export interface CartItemDetail{
    cart_item_id: number;
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
    items: CartItemDetail[];
    total_quantity: number;
    total_amount: number;
}