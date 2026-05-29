import { sendGAEvent } from "@next/third-parties/google";

declare global {
  interface Window {
    clarity?: (method: "event", eventName: string) => void;
  }
}

const safeClarityEvent = (eventName: string) => {
  if (typeof window === "undefined") return;
  try {
    window.clarity?.("event", eventName);
  } catch {
    // no-op: Clarity not loaded / blocked
  }
};

export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  sendGAEvent("event", eventName, params || {});
  safeClarityEvent(eventName);
};

export const trackHeroCTA = () => {
  trackEvent("hero_cta_clicked");
};

export const trackAddToCart = () => {
  trackEvent("add_to_cart");
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

export const trackSectionViewed = (sectionName: string) => {
  trackEvent("section_viewed", { section: sectionName });
};
