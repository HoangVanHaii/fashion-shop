export interface Product {
    id: number;
    shop_id: number;
    category_id: number;
    name: string;
    description?: string;
    price: number;
    stock: number;
    status: "active" | "hidden" | "banned";
    created_at: Date;
}
