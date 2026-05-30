import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import { RateLimiter } from "limiter";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "@/lib/env";

const limiters = new Map<string, RateLimiter>();
const MAX_TRACKED_IPS = 5000;

function getLimiter(ip: string) {
  if (!limiters.has(ip)) {
    if (limiters.size >= MAX_TRACKED_IPS) {
      const firstKey = limiters.keys().next().value;
      if (firstKey !== undefined) limiters.delete(firstKey);
    }
    limiters.set(ip, new RateLimiter({ tokensPerInterval: 5, interval: "minute" }));
  }
  return limiters.get(ip)!;
}

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "unknown";

    const limiter = getLimiter(ip);
    if (!limiter.tryRemoveTokens(1)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const { cartItems, formData } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
    }

    if (!formData || !formData.email || !formData.firstName) {
      return NextResponse.json({ error: "Missing customer information" }, { status: 400 });
    }

    if (!/^[6-9]\d{9}$/.test(String(formData.phone || ""))) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (!/^[1-9]\d{5}$/.test(String(formData.pinCode || ""))) {
      return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
    }

    const key_id = RAZORPAY_KEY_ID;
    const key_secret = RAZORPAY_KEY_SECRET;

    const supabase = createAdminClient();

    let totalAmount = 0;
    const orderItemsToInsert = [];

    // Validate products and calculate total securely
    for (const item of cartItems) {
      if (!item.id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, price, inventory_count, is_active")
        .eq("id", item.id)
        .single();

      if (productError || !product) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 });
      }

      if (!product.is_active) {
        return NextResponse.json({ error: `Product is no longer available` }, { status: 400 });
      }

      if (product.inventory_count < item.quantity) {
        return NextResponse.json({ error: `Insufficient inventory for product` }, { status: 400 });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsToInsert.push({
        product_id: product.id,
        quantity: item.quantity,
        price_at_purchase: product.price,
      });
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    // Upsert Customer
    const fullName = `${formData.firstName} ${formData.lastName || ""}`.trim();
    let customerId: string;

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", formData.email)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await supabase
        .from("customers")
        .update({ name: fullName, phone: formData.phone })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: fullName,
          email: formData.email,
          phone: formData.phone,
        })
        .select("id")
        .single();

      if (customerError) {
        console.error("Customer creation failed:", customerError);
        return NextResponse.json({ error: "Failed to create customer record" }, { status: 500 });
      }
      customerId = newCustomer.id;
    }

    // Create Razorpay Order
    const razorpay = new Razorpay({ key_id, key_secret });
    const amountInPaise = Math.round(totalAmount * 100);

    const rzpOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(rzpOptions);

    // Create pending order in Supabase
    const shippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      apartment: formData.apartment,
      city: formData.city,
      state: formData.state,
      pinCode: formData.pinCode,
    };

    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        total_amount: totalAmount,
        payment_status: "pending",
        order_status: "pending",
        shipping_address: shippingAddress,
        razorpay_order_id: razorpayOrder.id,
      })
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("Order creation failed:", orderError);
      return NextResponse.json({ error: "Failed to create pending order" }, { status: 500 });
    }

    // Insert pending order items
    const orderItemsWithOrderId = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: newOrder.id,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error("Failed to insert order items:", itemsError);
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    return NextResponse.json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      internalOrderId: newOrder.id,
      internalOrderNumber: newOrder.order_number,
    });
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
