import { sendGAEvent } from "@next/third-parties/google";

export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("GA Event:", eventName, params);
  }
  sendGAEvent("event", eventName, params || {});
};

export const trackShopNowClick = () => {
  trackEvent("shop_now_clicked");
};

export const trackCheckoutStarted = (cartTotal: number, itemCount: number) => {
  trackEvent("checkout_started", {
    value: cartTotal,
    currency: "INR",
    items_count: itemCount,
  });
};

export const trackPaymentSuccess = (orderId: string, value: number) => {
  trackEvent("payment_success", {
    transaction_id: orderId,
    value,
    currency: "INR",
  });
};

export const trackInvoiceGenerated = (orderId: string) => {
  trackEvent("invoice_generated", {
    order_id: orderId,
  });
};

export const trackWhatsappClicked = () => {
  trackEvent("whatsapp_clicked");
};
