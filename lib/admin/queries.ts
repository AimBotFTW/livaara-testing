import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus, Product, Review } from "@/lib/types/database";

export type AdminProductRow = Pick<
  Product,
  "id" | "name" | "description" | "price" | "inventory_count" | "is_active"
>;

export type DashboardMetrics = {
  totalRevenue: number;
  totalOrders: number;
  inventoryCount: number;
  revenueChangePercent: number | null;
};

export type RecentOrderRow = {
  id: string;
  displayId: string;
  customerName: string;
  createdAt: string;
  totalAmount: number;
  orderStatus: OrderStatus;
};

export type CustomerDirectoryRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  joinDate: string;
  totalOrders: number;
  totalSpend: number;
};

export type OrderDetail = {
  id: string;
  displayId: string;
  orderStatus: OrderStatus;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  shippingAddress: Record<string, unknown>;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
  };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
};

function getClient() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

function unwrapRelation<T>(rel: T | T[] | null | undefined): T | null {
  if (rel == null) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = getClient();
  if (!supabase) {
    return { totalRevenue: 0, totalOrders: 0, inventoryCount: 0, revenueChangePercent: null };
  }

  const [{ data: paidOrders }, { count: orderCount }, { data: products }] = await Promise.all([
    supabase.from("orders").select("total_amount, created_at").eq("payment_status", "paid"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("products").select("inventory_count"),
  ]);

  const totalRevenue = paidOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;
  const inventoryCount = products?.reduce((sum, p) => sum + (p.inventory_count ?? 0), 0) ?? 0;

  let revenueChangePercent: number | null = null;
  if (paidOrders && paidOrders.length > 0) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const recent = paidOrders.filter((o) => new Date(o.created_at) >= thirtyDaysAgo);
    const prior = paidOrders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });
    const recentSum = recent.reduce((s, o) => s + Number(o.total_amount), 0);
    const priorSum = prior.reduce((s, o) => s + Number(o.total_amount), 0);
    if (priorSum > 0) {
      revenueChangePercent = Math.round(((recentSum - priorSum) / priorSum) * 100);
    }
  }

  return {
    totalRevenue,
    totalOrders: orderCount ?? 0,
    inventoryCount,
    revenueChangePercent,
  };
}

export async function getRecentOrders(limit = 20): Promise<RecentOrderRow[]> {
  const supabase = getClient();
  if (!supabase) return [];

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      total_amount,
      order_status,
      created_at,
      customers ( name )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !orders) {
    console.warn("[getRecentOrders]", error?.message);
    return [];
  }

  return orders.map((o) => {
    const customer = unwrapRelation(o.customers as { name: string } | { name: string }[] | null);
    const name = customer?.name;
    return {
      id: o.id,
      displayId: o.order_number
        ? `#${String(o.order_number).padStart(3, "0")}`
        : `ORD-${o.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`,
      customerName: name ?? "Unknown",
      createdAt: o.created_at,
      totalAmount: Number(o.total_amount),
      orderStatus: o.order_status as OrderStatus,
    };
  });
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const supabase = getClient();
  if (!supabase) return null;

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      order_status,
      payment_status,
      total_amount,
      created_at,
      razorpay_order_id,
      razorpay_payment_id,
      shipping_address,
      customers ( name, email, phone ),
      order_items (
        id,
        quantity,
        price_at_purchase,
        products ( name )
      )
    `,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    console.warn("[getOrderDetail]", error?.message);
    return null;
  }

  const customer = unwrapRelation(
    order.customers as
      | { name: string; email: string | null; phone: string | null }
      | Array<{ name: string; email: string | null; phone: string | null }>
      | null,
  );

  const items = (
    order.order_items as Array<{
      id: string;
      quantity: number;
      price_at_purchase: number;
      products: { name: string } | { name: string }[] | null;
    }> | null
  )?.map((item) => {
    const product = unwrapRelation(item.products);
    const productName = product?.name;
    return {
      id: item.id,
      productName: productName ?? "Product",
      quantity: item.quantity,
      priceAtPurchase: Number(item.price_at_purchase),
    };
  });

  return {
    id: order.id,
    displayId: order.order_number
      ? `#${String(order.order_number).padStart(3, "0")}`
      : `ORD-${order.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`,
    orderStatus: order.order_status as OrderStatus,
    paymentStatus: order.payment_status,
    totalAmount: Number(order.total_amount),
    createdAt: order.created_at,
    razorpayOrderId: order.razorpay_order_id,
    razorpayPaymentId: order.razorpay_payment_id,
    shippingAddress: (order.shipping_address as Record<string, unknown>) ?? {},
    customer: {
      name: customer?.name ?? "Unknown",
      email: customer?.email ?? null,
      phone: customer?.phone ?? null,
    },
    items: items ?? [],
  };
}

export async function getAdminProducts(): Promise<AdminProductRow[]> {
  const supabase = getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, inventory_count, is_active")
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.warn("[getAdminProducts]", error?.message);
    return [];
  }

  return data.map((p) => ({
    ...p,
    price: Number(p.price),
    inventory_count: Number(p.inventory_count),
  })) as AdminProductRow[];
}

export async function getCustomersDirectory(): Promise<CustomerDirectoryRow[]> {
  const supabase = getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("customers")
    .select(
      `
      id,
      name,
      email,
      phone,
      created_at,
      orders ( id, total_amount, payment_status )
    `,
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("[getCustomersDirectory]", error?.message);
    return [];
  }

  return data.map((c) => {
    const orders = Array.isArray(c.orders) ? c.orders : [];
    const totalSpend = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      joinDate: c.created_at,
      totalOrders: orders.length,
      totalSpend,
    };
  });
}
