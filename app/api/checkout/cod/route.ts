import React from "react";
import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { CustomerReceiptEmail } from "@/components/emails/CustomerReceiptEmail";
import { AdminNotificationEmail } from "@/components/emails/AdminNotificationEmail";
import { headers } from "next/headers";
import { RateLimiter } from "limiter";

const limiters = new Map<string, RateLimiter>();

function getLimiter(ip: string) {
  // Prevent memory leak by clearing if it gets too large
  if (limiters.size > 10000) {
    limiters.clear();
  }
  if (!limiters.has(ip)) {
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

    const supabase = createAdminClient();
    let subtotal = 0;
    const orderItemsToInsert = [];
    const itemsForEmail = [];

    // Validate products and calculate total securely
    for (const item of cartItems) {
      if (!item.id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, price, inventory_count, is_active, name")
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
      subtotal += itemTotal;

      orderItemsToInsert.push({
        product_id: product.id,
        quantity: item.quantity,
        price_at_purchase: product.price,
      });

      itemsForEmail.push({
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    if (subtotal <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    const codCharge = 40;
    const totalAmount = subtotal + codCharge;

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

    const orderData = {
      customer_id: customerId,
      total_amount: totalAmount,
      payment_method: "cod",
      payment_status: "pending",
      order_status: "processing",
      cod_charge: codCharge,
      shipping_address: shippingAddress,
    };

    const { data: newOrder, error: orderError } = await supabase.rpc("create_order_transaction", {
      p_order_data: orderData,
      p_items: orderItemsToInsert,
    });

    if (orderError || !newOrder) {
      console.error("Order transaction failed:", orderError);
      return NextResponse.json(
        {
          error: orderError?.message || "Failed to create order (possibly insufficient inventory)",
        },
        { status: 500 },
      );
    }

    // Send Transactional Emails
    const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");
    const addressString = `${shippingAddress.firstName} ${shippingAddress.lastName}\n${shippingAddress.address} ${shippingAddress.apartment ? shippingAddress.apartment + " " : ""}\n${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pinCode}`;

    try {
      await resend.emails.send({
        from: `LIVAARA <${process.env.RESEND_FROM_EMAIL}>`,
        to: formData.email,
        subject: `Order Confirmed — Lomaras™ Ayurvedic Scalp Oil`,
        html: await render(
          React.createElement(CustomerReceiptEmail, {
            orderNumber: newOrder.order_number,
            customerName: shippingAddress.firstName,
            shippingAddress: addressString,
            totalAmount: totalAmount,
            subtotal: subtotal,
            codCharge: codCharge,
            items: itemsForEmail,
            paymentMethod: "cod",
          }),
        ),
      });
    } catch (error) {
      console.error("[Resend customer email error]", error);
    }

    if (process.env.ADMIN_EMAIL) {
      try {
        await resend.emails.send({
          from: `LIVAARA System <${process.env.RESEND_FROM_EMAIL}>`,
          to: process.env.ADMIN_EMAIL,
          subject: `New COD Order #${String(newOrder.order_number).padStart(3, "0")} — Lomaras™`,
          html: await render(
            React.createElement(AdminNotificationEmail, {
              orderNumber: newOrder.order_number,
              customerName: fullName,
              customerEmail: formData.email,
              totalAmount: totalAmount,
              subtotal: subtotal,
              codCharge: codCharge,
              items: itemsForEmail,
              paymentMethod: "cod",
            }),
          ),
        });
      } catch (error) {
        console.error("[Resend admin email error]", error);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.order_number,
    });
  } catch (error) {
    console.error("COD Order Creation Error:", error);
    return NextResponse.json({ error: "Failed to process COD order" }, { status: 500 });
  }
}
