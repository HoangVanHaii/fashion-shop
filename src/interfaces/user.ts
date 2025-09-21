export interface User{
    id?: number;
    name: string;
    email: string;
    phone: string;
    date_of_birth?: Date;
    avatar?: string;
    password?: string;
    role?: "customer" | "seller" | "admin";
    status?: "active" | "banned";
    is_verified?: boolean;
    created_at?: Date;
}
