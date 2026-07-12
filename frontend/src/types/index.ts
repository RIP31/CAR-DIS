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
  | 'Reservation Submitted'
  | 'Dealer Reviewing'
  | 'Finance Approval'
  | 'Documents Verified'
  | 'Payment Pending'
  | 'Payment Received'
  | 'Ready for Delivery'
  | 'Delivered'
  | 'Rejected'
  | 'Cancelled';

export interface Purchase {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  vehicle_name: string;
  manufacturer: string;
  model: string;
  variant: string | null;
  purchase_price: number;
  quantity: number;
  status: PurchaseStatus;
  purchase_date: string;
  created_at: string;
  updated_at: string;
  
  // New Fields
  customer_name: string;
  customer_email: string;
  reservation_number: string;
  invoice_number: string;
  phone: string;
  alternate_phone?: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  govt_id_type: string;
  govt_id_number: string;
  driving_license_number?: string;
  date_of_birth: string;
  finance_required: boolean;
  trade_in_required: boolean;
  preferred_visit_date: string;
  preferred_visit_time: string;
  customer_notes?: string;
  dealer_notes?: string;
  expected_delivery_date?: string;
  timeline?: string;
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
