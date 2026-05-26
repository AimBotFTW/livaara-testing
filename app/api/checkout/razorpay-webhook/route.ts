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

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // We only care about successful payment captures
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
      }

      const supabase = createAdminClient();

      // 1. Check idempotency and update order atomically
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
        // Idempotency: Already processed
        return NextResponse.json({ received: true, message: "Already processed" });
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

      // 2. Fetch order items to decrement inventory
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", order.id);

      if (itemsError || !items) {
        console.error("Failed to fetch order items:", itemsError);
      } else {
        // Decrement inventory securely via RPC
        for (const item of items) {
          const { error: rpcError } = await supabase.rpc("decrement_product_inventory", {
            p_product_id: item.product_id,
            p_qty: item.quantity,
          });
          if (rpcError) {
            console.error("Failed to decrement inventory:", rpcError);
            // We don't throw here to ensure the order stays paid and emails are sent,
            // but in a robust system we'd flag this for admin review.
          }
        }
      }

      // 3. Send Transactional Emails
      try {
        const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");
        const customer = (Array.isArray(order.customers)
          ? order.customers[0]
          : order.customers) as unknown as { name: string; email: string };
        const sa = order.shipping_address as unknown as Record<string, string>;

        if (customer && customer.email && sa) {
          const addressString = `${sa.firstName} ${sa.lastName}\n${sa.address} ${sa.apartment ? sa.apartment + " " : ""}\n${sa.city}, ${sa.state} ${sa.pinCode}`;

          // Customer Receipt
          await resend.emails.send({
            from: "LIVAARA <onboarding@resend.dev>",
            to: customer.email,
            subject: `Your LIVAARA Order #${(order.order_number ?? 0).toString().padStart(3, "0")} Confirmation`,
            react: CustomerReceiptEmail({
              orderNumber: order.order_number ?? 0,
              customerName: sa.firstName,
              shippingAddress: addressString,
              totalAmount: order.total_amount,
            }) as React.ReactElement,
          });

          // Admin Notification
          if (process.env.ADMIN_EMAIL) {
            await resend.emails.send({
              from: "LIVAARA System <onboarding@resend.dev>",
              to: process.env.ADMIN_EMAIL,
              subject: `New Order Received! #${(order.order_number ?? 0).toString().padStart(3, "0")}`,
              react: AdminNotificationEmail({
                orderNumber: order.order_number ?? 0,
                customerName: customer.name || sa.firstName,
                customerEmail: customer.email,
                totalAmount: order.total_amount,
              }) as React.ReactElement,
            });
          }
        }
      } catch (emailError) {
        console.error("Failed to send transactional emails:", emailError);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true, message: "Ignored event type" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
