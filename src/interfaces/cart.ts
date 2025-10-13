export interface CartItem{
    cart_item_id?: number;
    cart_id?: number;
    size_id: number;
    quantity: number;
}
export interface CartItemDetail{
    cart_item_id: number;
    size_id: number;

    name: string;
    quantity: number;
    price: number;
    size: string;
    color: string;
    image_url: string;
    total_price: number;
}
export interface ShopCart{
    shop_id: number;
    shop_name: string;
    carts?: CartItemDetail[];
}
export interface Cart{
    shops: ShopCart[];
    total_quantity: number;
    total_amount: number;
}