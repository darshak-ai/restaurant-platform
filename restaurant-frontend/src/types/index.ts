export interface Restaurant {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone_number: string;
  email: string;
  latitude: number;
  longitude: number;
  description?: string;
  website?: string;
  image_url?: string;
  opening_hours?: Record<string, { open: string; close: string }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: number;
  menu_id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: number;
  menu_id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  calories?: number;
  ingredients?: string[];
  allergens?: string[];
  dietary_info?: string[];
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
}

export interface Menu {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  special_instructions?: string;
}

export interface Order {
  id?: number;
  order_number?: string;
  restaurant_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_type: 'pickup' | 'dine_in';
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  special_instructions?: string;
  estimated_ready_time?: string;
  status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'processing' | 'completed' | 'failed';
  otp_verified?: boolean;
  created_at?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'staff' | 'customer';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface CMSContent {
  id: number;
  title: string;
  slug: string;
  content_type: 'page' | 'hero_banner' | 'gallery_image' | 'announcement' | 'contact_info';
  status: 'draft' | 'published' | 'archived';
  content: string;
  excerpt?: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  display_order?: number;
  show_in_menu?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}
