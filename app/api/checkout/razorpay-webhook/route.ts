import React from "react";
import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { CustomerReceiptEmail } from "@/components/emails/CustomerReceiptEmail";
import { AdminNotificationEmail } from "@/components/emails/AdminNotificationEmail";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing RAZORPAY_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const providedBuf = Buffer.from(signature, "utf8");
    if (
      expectedBuf.length !== providedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, providedBuf)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // We only care about successful payment captures
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;
      const paymentAmount = payment.amount;
      const paymentCurrency = payment.currency;

      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
      }

      const supabase = createAdminClient();

      // 0. Secondary idempotency guard: check if this payment ID was already recorded
      // This guards against duplicate webhook events for the same payment_id
      const { data: existingPayment } = await supabase
        .from("orders")
        .select("id, payment_status")
        .eq("razorpay_payment_id", razorpayPaymentId)
        .maybeSingle();

      if (existingPayment) {
        return NextResponse.json({ received: true, message: "Already processed (payment_id)" });
      }

      // 1. Fetch the order by Razorpay order ID
      const { data: order, error: fetchError } = await supabase
        .from("orders")
        .select(
          `
          id,
          order_number,
          payment_status,
          total_amount,
          customers ( name, email ),
          shipping_address
        `,
        )
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (fetchError || !order) {
        console.error("Order not found for webhook:", razorpayOrderId);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.payment_status === "paid") {
        // Idempotency: Already processed via order_id route
        return NextResponse.json({ received: true, message: "Already processed" });
      }

      const expectedAmountPaise = Math.round(Number(order.total_amount) * 100);
      if (
        typeof paymentAmount !== "number" ||
        paymentCurrency !== "INR" ||
        paymentAmount !== expectedAmountPaise
      ) {
        console.error("[CRITICAL] Webhook amount/currency mismatch", {
          razorpayOrderId,
          razorpayPaymentId,
          expectedAmountPaise,
          paymentAmount,
          expectedCurrency: "INR",
          paymentCurrency,
          orderId: order.id,
        });
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }

      // Update the order to paid
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          order_status: "processing",
          razorpay_payment_id: razorpayPaymentId,
        })
        .eq("id", order.id)
        .eq("payment_status", "pending"); // Double check to prevent race condition

      if (updateError) {
        console.error("Failed to update order status:", updateError);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }

      // 2. Fetch order items to decrement inventory and build email data
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id, quantity, price_at_purchase, products ( name )")
        .eq("order_id", order.id);

      const itemsForEmail: Array<{ name: string; quantity: number; price: number }> = [];

      if (itemsError || !items) {
        console.error("Failed to fetch order items:", itemsError);
      } else {
        for (const item of items) {
          const product = Array.isArray(item.products) ? item.products[0] : item.products;
          itemsForEmail.push({
            name: (product as { name: string } | null)?.name ?? "Lomaras™ Ayurvedic Scalp Oil",
            quantity: item.quantity,
            price: Number(item.price_at_purchase),
          });
          const { error: rpcError } = await supabase.rpc("decrement_product_inventory", {
            p_product_id: item.product_id,
            p_qty: item.quantity,
          });
          if (rpcError) {
            console.error("Failed to decrement inventory:", rpcError);
          }
        }
      }

      // 3. Send Transactional Emails
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error("[CRITICAL] RESEND_API_KEY is not configured — transactional emails will not be sent");
      }
      const resend = new Resend(resendApiKey ?? "");
      const customer = (Array.isArray(order.customers)
        ? order.customers[0]
        : order.customers) as unknown as { name: string; email: string };
      const sa = order.shipping_address as unknown as Record<string, string>;

      if (customer && customer.email && sa) {
        const addressString = `${sa.firstName} ${sa.lastName}\n${sa.address} ${sa.apartment ? sa.apartment + " " : ""}\n${sa.city}, ${sa.state} ${sa.pinCode}`;

        // Customer Receipt
        try {
          await resend.emails.send({
            from: `LIVAARA <${process.env.RESEND_FROM_EMAIL}>`,
            to: customer.email,
            subject: `Your LIVAARA Order #${(order.order_number ?? 0).toString().padStart(3, "0")} Confirmation`,
            html: await render(
              React.createElement(CustomerReceiptEmail, {
                orderNumber: order.order_number ?? 0,
                customerName: sa.firstName,
                shippingAddress: addressString,
                totalAmount: order.total_amount,
                items: itemsForEmail,
                paymentMethod: "razorpay" as const,
              }),
            ),
          });
        } catch (error) {
          console.error("[Resend customer email error]", error);
        }

        // Admin Notification
        if (process.env.ADMIN_EMAIL) {
          try {
            await resend.emails.send({
              from: `LIVAARA System <${process.env.RESEND_FROM_EMAIL}>`,
              to: process.env.ADMIN_EMAIL,
              subject: `New Order Received! #${(order.order_number ?? 0).toString().padStart(3, "0")}`,
              html: await render(
                React.createElement(AdminNotificationEmail, {
                  orderNumber: order.order_number ?? 0,
                  customerName: customer.name || sa.firstName,
                  customerEmail: customer.email,
                  totalAmount: order.total_amount,
                  items: itemsForEmail,
                  paymentMethod: "razorpay" as const,
                }),
              ),
            });
          } catch (error) {
            console.error("[Resend admin email error]", error);
          }
        }
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true, message: "Ignored event type" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
