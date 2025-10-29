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
    price_after_reduction?:number;  //them moi
    size: string;
    color: string;
    image_url: string;
    total_price: number;
    selected?: boolean;
    sold_out?:boolean;
}
export interface ShopCart{
    shop_id: number;
    shop_name: string;
    carts?: CartItemDetail[];
    total_shop?:number;
}

export interface Cart{
    shops: ShopCart[];
    total_quantity: number;
    total_amount: number;
    voucher_discount?:number;
    voucher_code?:string;
}