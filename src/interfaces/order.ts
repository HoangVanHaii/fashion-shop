export interface Order {
    id?: number;
    user_id: number;
    voucher_id?: number;
    total: number;
    payment_method: 'cod' | 'credit_card' | 'paypal' | 'momo';
    shipping_name: string;
    shipping_address: string;
    shipping_phone: string;
    status?: 'pending' | 'confirm' | 'shipped' | 'completed' | 'cancelled';
    created_at?: Date;
}
export interface OrderItem {
    id?: number;
    order_id?: number;
    product_id: number;
    color_id: number;
    size_id:number;
    quantity: number;
    price: number;
}
export interface OrderItemDetail{
    id?: number;
    product_id: number;
    size_id:number;
    color_id: number;
    
    product_name: string;
    color:string;
    size: string;
    quantity: number;
    price: number;
    image_url: string;
}
export interface OderPayLoad {
    order: Order;
    orderItems: OrderItem[];
}
export interface GetOrder {
    order_id: number;
    status: "pending" | "confirm" | "shipped" |"completed" | "cancelled";
    created_at: Date;
    updatedAt?: Date;
    items: OrderItemDetail[];
    total: number; 
    payment_method?: 'cod' | 'credit_card' | 'paypal' | 'momo';
    shipping_name?: string;
    shipping_address?: string;
    shipping_phone?: string;
}