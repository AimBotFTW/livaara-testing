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
  description: string;
  price: number;
  inventory_count: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Order = {
  id: string;
  order_number?: number;
  customer_id: string;
  shipping_address: Record<string, unknown>;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
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
  customer_name: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  is_verified_buyer: boolean;
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
    Insert: Partial<Product> & Pick<Product, "name" | "price">;
    Update: Partial<Product>;
    Relationships: [];
  };
  orders: {
    Row: Order;
    Insert: Partial<Order> & Pick<Order, "customer_id" | "total_amount">;
    Update: Partial<Order>;
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
    Insert: Partial<Review> & Pick<Review, "customer_name" | "rating">;
    Update: Partial<Review>;
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
