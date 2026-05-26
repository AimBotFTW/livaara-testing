"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { CartItem } from "@/lib/context/CartContext";
import { Resend } from "resend";
import { CustomerReceiptEmail } from "@/components/emails/CustomerReceiptEmail";
import { AdminNotificationEmail } from "@/components/emails/AdminNotificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export type CheckoutFormData = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
};

export type CheckoutSuccessResult = {
  ok: boolean;
  orderId?: string;
  orderNumber?: number;
  error?: string;
};

export async function processCheckoutSuccessAction(
  paymentId: string, // Razorpay payment ID
  razorpayOrderId: string,
  cartItems: CartItem[],
  cartTotal: number,
  formData: CheckoutFormData,
): Promise<CheckoutSuccessResult> {
  try {
    const supabase = createAdminClient();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    // 1. Upsert Customer
    let customerId: string;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", formData.email)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Optional: update name and phone if needed
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

      if (customerError) throw new Error(`Customer creation failed: ${customerError.message}`);
      customerId = newCustomer.id;
    }

    // 2. Insert Order
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
        total_amount: cartTotal,
        payment_status: "paid",
        order_status: "processing",
        shipping_address: shippingAddress,
        notes: `Razorpay Order: ${razorpayOrderId} | Payment: ${paymentId}`,
      })
      .select("id, order_number")
      .single();

    if (orderError) throw new Error(`Order creation failed: ${orderError.message}`);
    const orderId = newOrder.id;
    const orderNumber = newOrder.order_number;

    // 3. Insert Order Items & 4. Decrement Inventory
    for (const item of cartItems) {
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      });

      if (itemError) {
        console.error("Order Item Insert Error:", itemError);
        throw new Error("Failed to insert order items");
      }

      // Decrement inventory (Safe raw decrement ideally, but we'll fetch and update here for simplicity)
      const { data: product } = await supabase
        .from("products")
        .select("inventory_count")
        .eq("id", item.id)
        .single();

      if (product) {
        await supabase
          .from("products")
          .update({ inventory_count: Math.max(0, product.inventory_count - item.quantity) })
          .eq("id", item.id);
      }
    }

    // 5. Send Transactional Emails
    try {
      const addressString = `${shippingAddress.firstName} ${shippingAddress.lastName}\n${shippingAddress.address} ${shippingAddress.apartment ? shippingAddress.apartment + " " : ""}\n${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pinCode}`;

      // Customer Email
      await resend.emails.send({
        from: "LIVAARA <onboarding@resend.dev>",
        to: formData.email,
        subject: `Your LIVAARA Order #${(orderNumber ?? 0).toString().padStart(3, "0")} Confirmation`,
        react: CustomerReceiptEmail({
          orderNumber: orderNumber ?? 0,
          customerName: formData.firstName,
          shippingAddress: addressString,
          totalAmount: cartTotal,
        }) as React.ReactElement,
      });

      // Admin Email
      if (process.env.ADMIN_EMAIL) {
        await resend.emails.send({
          from: "LIVAARA System <onboarding@resend.dev>",
          to: process.env.ADMIN_EMAIL,
          subject: `New Order Received! #${(orderNumber ?? 0).toString().padStart(3, "0")}`,
          react: AdminNotificationEmail({
            orderNumber: orderNumber ?? 0,
            customerName: fullName,
            customerEmail: formData.email,
            totalAmount: cartTotal,
          }) as React.ReactElement,
        });
      }
    } catch (emailError) {
      console.error("Failed to send transactional emails:", emailError);
    }

    return { ok: true, orderId, orderNumber };
  } catch (error) {
    console.error("Checkout Success Action Error:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Checkout processing failed",
    };
  }
}
