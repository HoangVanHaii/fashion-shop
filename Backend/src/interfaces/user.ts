export interface User{
    id?: number;
    name: string;
    email: string;
    phone: string;
    date_of_birth?: Date;
    gender?: "male" | "female" | "other";
    avatar?: string;
    password?: string;
    role?: "customer" | "seller" | "admin";
    status?: "active" | "banned";
    is_verified?: boolean;
    created_at?: Date;
}

export interface SellerRequest{
    id?: number;
    user_id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    cccd: string;
    description: string;
    status?: "pending" | "approved" | "rejected";
    request_date?: Date;
}


export interface Shop {
    id: number;
    seller_id: number;
    name: string;
    phone: string;
    address?: string | null;
    email: string;
    cccd: string;
    description?: string | null;
    logo?: string | null;
    status: 'active' | 'banned';
    created_at: Date;
}
  
export interface ShopVisit {
    id: number;
    shop_id: number;
    ip_address: string;
    visit_date: Date;
    visit_count: number;
}
  
export interface ShopDetal{
    id: number;
    shop_name: string;
    logo: string;
    description: string;
    address: string;
    rating: number;
    visit_count: number;
}
export interface ShopToDoSummary {
    shop_id: number;
    pendingOrderCount: number;
    confirmedOrderCount: number;
    cancelledOrderCount: number;
    bannedProductCount: number;
}
export interface ShopStatistic {
    shop_id: number;
    totalRevenue: number;
    totalVisit: number;
    totalOrder: number;
}
export interface reviewsDetail {
    id: number;
    product_name: string;
    product_image: string;
    product_size: string;
    quantity: number;
    rating: number;
    comment: string;
    reviewImage: reviewImages[];
}  
export interface reviewImages {
    id: number;
    image_url: string
}

export interface ReviewSummary { 
    totalReviewCount: number;
    positiveReviewRate: number; 
    negativeReviewCount: number;  
    recentReviewCount: number;    
  }
  