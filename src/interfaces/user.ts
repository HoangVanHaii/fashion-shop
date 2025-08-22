export interface User{
    id?: number;
    name: string;
    email: string;
    password: string;
    role?: "customer" | "seller" | "admin";
    status?: "active" | "banned";
    is_verified?: boolean;
    created_at?: Date;
}