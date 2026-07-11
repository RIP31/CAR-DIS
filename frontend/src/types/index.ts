export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year: number;
  fuel_type: string;
  transmission: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export type PurchaseStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Payment Pending'
  | 'Documents Pending'
  | 'Ready for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Purchase {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  vehicle_name: string;
  purchase_price: number;
  quantity: number;
  status: PurchaseStatus;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  vehicle_id: string;
  created_at: string;
}

export interface CallbackRequest {
  id: string;
  name: string;
  phone: string;
  preferred_time: string;
  message: string | null;
  vehicle_id: string | null;
  created_at: string;
}
