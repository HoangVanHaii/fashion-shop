export interface Order {
    id?: number;
    user_id: number;
    voucher_id?: number;
    discount_value?: number;
    total: number;
    payment_method: 'cod' | 'credit_card' | 'paypal' | 'vnpay' | 'momo';
    shipping_name: string;
    shipping_address: string;
    shipping_phone: string;
    status?: 'pending' | 'confirm' | 'shipped' | 'completed' | 'cancelled';
    created_at?: Date;
}
export interface OrderItem {
    id?: number;
    order_id?: number;
    size_id: number;
    quantity: number;
    price: number;
    flash_sale_item_id: number;
}
export interface OrderItemDetail {
    id?: number;
    product_id: number;
    size_id: number;
    color_id: number;

    product_name: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
    image_url: string;
    flash_price: number;
}
export interface OderPayLoad {
    order: Order;
    orderItems: OrderItem[];
}
export interface GetOrder {
    order_id: number;
    status: "pending" | "confirmed" | "shipped" | "completed" | "cancelled";
    created_at: Date;
    updatedAt?: Date;
    items: OrderItemDetail[];
    shop_name?: string;
    total: number;
    payment_method?: 'cod' | 'credit_card' | 'paypal' | 'momo' | 'vnpay';
    shipping_name?: string;
    shipping_address?: string;
    shipping_phone?: string;
    discount_value?: number;
    shop_id: number
}
export interface createOrder{
    // shop
}