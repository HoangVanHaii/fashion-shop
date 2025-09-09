export interface Order {
    id?: number;
    user_id: number;
    total: number;
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