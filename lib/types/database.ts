export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "razorpay" | "cod" | "offline";

export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  inventory_count: number;
  is_active: boolean;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Order = {
  id: string;
  customer_id: string;
  shipping_address: Record<string, unknown>;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
};

export type Review = {
  id: string;
  product_id: string;
  customer_id: string | null;
  reviewer_name: string | null;
  rating: number;
  review_text: string;
  is_approved: boolean;
  is_verified_purchase: boolean;
  image_url: string | null;
  created_at: string;
};

type Tables = {
  customers: {
    Row: Customer;
    Insert: Partial<Customer> & Pick<Customer, "name">;
    Update: Partial<Customer>;
    Relationships: [];
  };
  products: {
    Row: Product;
    Insert: Partial<Product> & Pick<Product, "name" | "price" | "slug">;
    Update: Partial<Product>;
    Relationships: [];
  };
  orders: {
    Row: Order;
    Insert: Omit<Partial<Order>, "id" | "created_at" | "updated_at"> &
      Pick<Order, "customer_id" | "total_amount">;
    Update: Partial<Omit<Order, "id" | "created_at">>;
    Relationships: [];
  };
  order_items: {
    Row: OrderItem;
    Insert: Partial<OrderItem> &
      Pick<OrderItem, "order_id" | "product_id" | "quantity" | "price_at_purchase">;
    Update: Partial<OrderItem>;
    Relationships: [];
  };
  reviews: {
    Row: Review;
    Insert: Omit<Partial<Review>, "id" | "created_at"> &
      Pick<Review, "product_id" | "rating" | "review_text">;
    Update: Partial<Omit<Review, "id" | "created_at">>;
    Relationships: [];
  };
};

export type Database = {
  public: {
    Tables: Tables;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      payment_status: PaymentStatus;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
    };
    CompositeTypes: Record<string, never>;
  };
};
