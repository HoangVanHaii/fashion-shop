export interface Order {
    id?: number;
    user_id: number;
    voucher_id?: number;
    total: number;
    payment_method: 'cod' | 'credit_card' | 'paypal' | 'momo';
    shipping_name: string;
    shipping_address: string;
    shipping_phone: string;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    created_at?: Date;
}
export interface OrderItem {
    id?: number;
    order_id?: number;
    product_id: number;
    quantity: number;
    price: number;
}
export interface createOderPayLoad {
    order: Order;
    orderItems: OrderItem[];
}