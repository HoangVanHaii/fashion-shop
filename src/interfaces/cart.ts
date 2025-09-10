export interface Cart{
    id?: number;
    user_id: number;
    created_at?: Date;
}
export interface CartItem{
    id?: number;
    cart_id: number;
    product_id: number;
    quantity: number;
}
export interface CartItemDetail{
    id?: number;
    product_id: number;
    name: string;
    quantity: number;
    price: number;
}
