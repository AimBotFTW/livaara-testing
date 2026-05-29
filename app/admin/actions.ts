"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/auth";
import { getOrderDetail } from "@/lib/admin/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus, PaymentStatus } from "@/lib/types/database";

const ORDER_FLOW: OrderStatus[] = ["processing", "shipped", "delivered"];

function admin() {
  return createAdminClient();
}

async function guard() {
  const session = await requireAdminSession();
  if (!session.ok) return session;
  return session;
}

export async function loginAction(email: string, password: string) {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false as const, error: "Supabase is not configured" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/admin");
  return { ok: true as const };
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/admin");
  redirect("/admin/login");
}

export async function fetchOrderDetailAction(orderId: string) {
  const session = await guard();
  if (!session.ok) return null;
  return getOrderDetail(orderId);
}

export async function updateOrderStatusAction(orderId: string, orderStatus: OrderStatus) {
  const session = await guard();
  if (!session.ok) return { ok: false as const, error: session.error };

  if (!ORDER_FLOW.includes(orderStatus)) {
    return { ok: false as const, error: "Invalid status" };
  }

  try {
    const supabase = admin();
    const { error } = await supabase
      .from("orders")
      .update({ order_status: orderStatus })
      .eq("id", orderId);

    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function approveReviewAction(reviewId: string) {
  const session = await guard();
  if (!session.ok) return { ok: false as const, error: session.error };

  try {
    const supabase = admin();
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: true })
      .eq("id", reviewId);

    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Approve failed" };
  }
}

export async function deleteReviewAction(reviewId: string) {
  const session = await guard();
  if (!session.ok) return { ok: false as const, error: session.error };

  try {
    const supabase = admin();
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Delete failed" };
  }
}

export async function updateInventoryAction(productId: string, inventoryCount: number) {
  const session = await guard();
  if (!session.ok) return { ok: false as const, error: session.error };

  if (!Number.isInteger(inventoryCount) || inventoryCount < 0) {
    return { ok: false as const, error: "Inventory must be a non-negative whole number" };
  }

  try {
    const supabase = admin();
    const { error } = await supabase
      .from("products")
      .update({ inventory_count: inventoryCount })
      .eq("id", productId);

    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export type ManualOrderInput = {
  customerName: string;
  email: string;
  phone: string;
  prakriti?: string[];
  shippingAddress: string;
  paymentLabel: "Cash" | "Bank Transfer";
  productId: string;
  quantity: number;
  customItemPrice?: number;
  codCharge?: number;
  customProductName?: string;
  notes?: string;
  orderStatus?: OrderStatus;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
};

export async function createManualOrderAction(input: ManualOrderInput) {
  const session = await guard();
  if (!session.ok) return { ok: false as const, error: session.error };

  const name = input.customerName.trim();
  const phone = input.phone.trim();
  const address = input.shippingAddress.trim();

  if (!name || !phone || !address) {
    return { ok: false as const, error: "Name, phone, and address are required" };
  }

  if (input.quantity < 1) {
    return { ok: false as const, error: "Quantity must be at least 1" };
  }

  try {
    const supabase = admin();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, price, inventory_count, is_active")
      .eq("id", input.productId)
      .maybeSingle();

    if (productError || !product) {
      return { ok: false as const, error: "Product not found" };
    }

    if (!product.is_active) {
      return { ok: false as const, error: "Product is not active" };
    }

    if (product.inventory_count < input.quantity) {
      return { ok: false as const, error: "Insufficient inventory" };
    }

    const price =
      input.customItemPrice !== undefined ? Number(input.customItemPrice) : Number(product.price);
    const codCharge = input.codCharge || 0;
    const totalAmount = price * input.quantity + codCharge;

    const email = input.email.trim();

    let customerId: string;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await supabase
        .from("customers")
        .update({ prakriti: input.prakriti ?? [] })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({ name, phone, email, prakriti: input.prakriti ?? [] })
        .select("id")
        .single();

      if (customerError || !newCustomer) {
        return { ok: false as const, error: customerError?.message ?? "Failed to create customer" };
      }
      customerId = newCustomer.id;
    }

    const shippingAddress = {
      line1: address,
      offline_payment_method: input.paymentLabel,
      source: "manual_admin",
      customProductName: input.customProductName || null,
      notes: input.notes || null,
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        shipping_address: shippingAddress,
        total_amount: totalAmount,
        payment_method: "offline",
        payment_status: input.paymentStatus || "paid",
        order_status: input.orderStatus || "processing",
        cod_charge: codCharge,
        razorpay_order_id: null,
        razorpay_payment_id: null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return { ok: false as const, error: orderError?.message ?? "Failed to create order" };
    }

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: product.id,
      quantity: input.quantity,
      price_at_purchase: price,
    });

    if (itemError) {
      return { ok: false as const, error: itemError.message };
    }

    const { error: invError } = await supabase.rpc("decrement_product_inventory", {
      p_product_id: product.id,
      p_qty: input.quantity,
    });

    if (invError) {
      await supabase
        .from("products")
        .update({ inventory_count: product.inventory_count - input.quantity })
        .eq("id", product.id);
    }

    revalidatePath("/admin");
    return { ok: true as const, orderId: order.id as string };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Order creation failed" };
  }
}

export async function seedInitialProductAction() {
  const session = await guard();
  if (!session.ok) return { ok: false as const, error: session.error };

  try {
    const supabase = admin();
    const { error } = await supabase.from("products").insert({
      name: "Lomaras™ Ayurvedic Scalp Oil",
      description: "A luxurious blend of botanical extracts for ultimate scalp nourishment.",
      price: 599,
      inventory_count: 100,
      is_active: true,
    });

    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Seed failed" };
  }
}

export async function deleteOrderAction(orderId: string) {
  const session = await guard();
  if (!session.ok) return { ok: false as const, error: session.error };

  try {
    const supabase = admin();
    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Delete failed" };
  }
}

export type UpdateOrderInput = {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  shippingAddress: string;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerPrakriti?: string[];
  codCharge?: number;
  items: Array<{
    id: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
};

export async function updateOrderAction(input: UpdateOrderInput) {
  const session = await guard();
  if (!session.ok) return { ok: false as const, error: session.error };

  try {
    const supabase = admin();

    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("customer_id, shipping_address")
      .eq("id", input.orderId)
      .single();

    if (fetchErr || !order) return { ok: false as const, error: "Order not found" };

    const originalAddress = order.shipping_address as Record<string, unknown> | null;
    const newAddress = {
      ...(originalAddress || {}),
      line1: input.shippingAddress,
      notes: input.notes || null,
    };

    const { error: orderErr } = await supabase
      .from("orders")
      .update({
        order_status: input.orderStatus,
        payment_status: input.paymentStatus,
        total_amount: input.totalAmount,
        cod_charge: input.codCharge,
        shipping_address: newAddress,
      })
      .eq("id", input.orderId);

    if (orderErr) throw new Error(orderErr.message);

    if (
      input.customerName !== undefined ||
      input.customerEmail !== undefined ||
      input.customerPhone !== undefined
    ) {
      await supabase
        .from("customers")
        .update({
          ...(input.customerName ? { name: input.customerName } : {}),
          ...(input.customerEmail !== undefined ? { email: input.customerEmail || null } : {}),
          ...(input.customerPhone !== undefined ? { phone: input.customerPhone || null } : {}),
          ...(input.customerPrakriti !== undefined ? { prakriti: input.customerPrakriti } : {}),
        })
        .eq("id", order.customer_id);
    }

    for (const item of input.items) {
      await supabase
        .from("order_items")
        .update({
          quantity: item.quantity,
          price_at_purchase: item.priceAtPurchase,
        })
        .eq("id", item.id);
    }

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function updateCustomerAction(
  customerId: string,
  data: { name: string; email: string; phone: string },
) {
  const session = await guard();
  if (!session.ok) return { ok: false as const, error: session.error };

  try {
    const supabase = admin();
    const { error } = await supabase
      .from("customers")
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone,
      })
      .eq("id", customerId);

    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function deleteCustomerAction(customerId: string) {
  const session = await guard();
  if (!session.ok) return { ok: false as const, error: session.error };

  try {
    const supabase = admin();

    // Check if customer has orders
    const { count, error: countErr } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    if (countErr) {
      return { ok: false as const, error: countErr.message };
    }

    if (count && count > 0) {
      return {
        ok: false as const,
        error: "Cannot delete customer with existing orders. Delete their orders first.",
      };
    }

    const { error } = await supabase.from("customers").delete().eq("id", customerId);

    if (error) {
      return { ok: false as const, error: error.message };
    }

    revalidatePath("/admin");
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Delete failed" };
  }
}

export async function markCodAsPaid(orderId: string) {
  const session = await guard();
  if (!session.ok) return { success: false, error: session.error };

  try {
    const supabase = admin();
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        order_status: "processing",
      })
      .eq("id", orderId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Update failed" };
  }
}
