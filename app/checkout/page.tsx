"use client";

import { useCart } from "@/lib/context/CartContext";
import { useState, FormEvent } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { processCheckoutSuccessAction, type CheckoutFormData } from "@/app/actions/checkout";
import { trackPaymentSuccess } from "@/lib/analytics";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      on: (event: string, callback: (response: { error: { description: string } }) => void) => void;
      open: () => void;
    };
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, toggleCart } = useCart();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("Your cart is empty");

    setIsProcessing(true);

    try {
      // 1. Create Razorpay Order on Backend
      const res = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal }),
      });

      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Failed to create order");

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Livaara",
        description: "Ayurvedic Scalp Oil",
        order_id: order.id,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
        }) {
          try {
            // 3. Process Checkout Success
            const result = await processCheckoutSuccessAction(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              cartItems,
              cartTotal,
              formData,
            );

            if (result.ok) {
              if (result.orderId) {
                trackPaymentSuccess(result.orderId, cartTotal);
              }

              if (result.orderNumber) {
                toggleCart(false);
                router.push(
                  `/order-success?id=${result.orderId}&order_number=${result.orderNumber}`,
                );
              } else {
                toggleCart(false);
                router.push(`/order-success?id=${result.orderId}`);
              }
            } else {
              alert("Payment verified but order creation failed: " + result.error);
            }
          } catch (err) {
            console.error("Order fulfillment error:", err);
            alert("An error occurred while fulfilling your order.");
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#596244", // Deep sage green
        },
      };

      const rzp = new window.Razorpay(options as unknown as Record<string, unknown>);
      rzp.on("payment.failed", function (response: { error: { description: string } }) {
        console.error("Payment Failed:", response.error);
        alert("Payment failed! Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1b1c1c] font-sans selection:bg-[#dee7c0]/50 flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Material Symbols and Playfair Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="bg-[#fcf9f8]/80 docked full-width top-0 sticky z-50 backdrop-blur-md border-b border-[#c8c7be]/20 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity duration-300 active:scale-95 duration-200 flex items-center"
            >
              <span className="material-symbols-outlined text-[#596244]">arrow_back</span>
            </Link>
            <h1 className="font-serif text-xl md:text-2xl text-[#1b1c1c] tracking-[0.2em] uppercase">
              LIVAARA
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8">
              <Link
                href="#"
                className="font-sans text-sm text-[#474741] hover:opacity-80 transition-opacity"
              >
                Skin
              </Link>
              <Link
                href="#"
                className="font-sans text-sm text-[#474741] hover:opacity-80 transition-opacity"
              >
                Rituals
              </Link>
              <Link
                href="#"
                className="font-sans text-sm text-[#474741] hover:opacity-80 transition-opacity"
              >
                Philosophy
              </Link>
            </nav>
            <button className="hover:opacity-80 transition-opacity duration-300 active:scale-95 duration-200 relative">
              <span className="material-symbols-outlined text-[#596244]">shopping_bag</span>
              <span className="absolute -top-1 -right-1 bg-[#596244] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] w-full mx-auto px-6 md:px-16 py-12 flex-grow">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-10 overflow-x-auto whitespace-nowrap">
          <span className="font-sans text-xs uppercase tracking-wider text-[#596244] font-medium">
            Cart
          </span>
          <span className="material-symbols-outlined text-[14px] text-[#c8c7be]">
            chevron_right
          </span>
          <span className="font-sans text-xs uppercase tracking-wider text-[#1b1c1c] font-bold">
            Information
          </span>
          <span className="material-symbols-outlined text-[14px] text-[#c8c7be]">
            chevron_right
          </span>
          <span className="font-sans text-xs uppercase tracking-wider text-[#474741]/60">
            Shipping
          </span>
          <span className="material-symbols-outlined text-[14px] text-[#c8c7be]">
            chevron_right
          </span>
          <span className="font-sans text-xs uppercase tracking-wider text-[#474741]/60">
            Payment
          </span>
        </nav>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">
          {/* Left Column: Form */}
          <div className="space-y-12">
            <form onSubmit={handlePayment} className="space-y-12">
              {/* Contact Section */}
              <section className="space-y-6">
                <div className="flex justify-between items-baseline">
                  <h2 className="font-serif text-2xl text-[#1b1c1c]">Contact</h2>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs text-[#474741]">
                      Already have an account?
                    </span>
                    <Link
                      href="#"
                      className="font-sans text-xs text-[#596244] underline decoration-[#596244]/30 hover:decoration-[#596244] transition-all"
                    >
                      Log in
                    </Link>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email or mobile phone number"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                    required
                  />
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newsletter"
                      className="rounded border-[#c8c7be] text-[#596244] focus:ring-[#596244] w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor="newsletter"
                      className="font-sans text-xs text-[#474741] cursor-pointer select-none"
                    >
                      Email me with Ayurvedic rituals and exclusive offers
                    </label>
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="space-y-6">
                <h2 className="font-serif text-2xl text-[#1b1c1c]">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <select className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none appearance-none cursor-pointer text-[#1b1c1c]">
                      <option>India</option>
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>Europe</option>
                    </select>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                      required
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 relative">
                    <input
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 relative">
                    <input
                      type="text"
                      name="apartment"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={formData.apartment}
                      onChange={handleChange}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                      className="bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                      required
                    />
                    <input
                      type="text"
                      name="pinCode"
                      placeholder="PIN / ZIP code"
                      value={formData.pinCode}
                      onChange={handleChange}
                      className="bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 relative">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                      required
                    />
                  </div>
                </div>

                {/* Razorpay Banner Info */}
                <div className="mt-8 border border-[#596244]/20 rounded-xl p-6 bg-[#596244]/5 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-4 border-[#596244] bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#596244]"></div>
                    </div>
                    <span className="font-semibold text-[#1b1c1c] text-sm">
                      Secure Checkout via Razorpay
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 pl-8 leading-relaxed">
                    Razorpay supports credit cards, UPI (GPay, PhonePe, Paytm), net banking, and
                    digital wallets. Your financial details are safe and fully encrypted.
                  </p>
                </div>

                <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <Link
                    href="/"
                    className="font-sans text-sm text-[#474741] flex items-center gap-2 hover:text-[#596244] transition-colors group"
                  >
                    <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">
                      arrow_back
                    </span>
                    Return to cart
                  </Link>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full md:w-auto bg-[#596244] text-white px-10 py-5 rounded-lg font-sans text-sm font-semibold tracking-wider hover:bg-[#596244]/90 transition-all shadow-md active:scale-95 disabled:opacity-50 uppercase"
                  >
                    {isProcessing ? "PROCESSING..." : `PAY NOW (${formatCurrency(cartTotal)})`}
                  </button>
                </div>
              </section>
            </form>

            {/* Trust Badges */}
            <section className="pt-12 border-t border-[#c8c7be]/20 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-[#f9f6f1]/50 border border-[#c8c7be]/10 text-center space-y-2">
                <span className="material-symbols-outlined text-[#596244] text-[32px]">eco</span>
                <h4 className="font-serif text-base text-[#1b1c1c] font-medium">Pure Botanicals</h4>
                <p className="font-sans text-xs text-[#474741] leading-relaxed">
                  Sourced from organic Himalayan foothills for maximum potency.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-[#f9f6f1]/50 border border-[#c8c7be]/10 text-center space-y-2">
                <span className="material-symbols-outlined text-[#596244] text-[32px]">
                  clinical_notes
                </span>
                <h4 className="font-serif text-base text-[#1b1c1c] font-medium">
                  Clinically Proven
                </h4>
                <p className="font-sans text-xs text-[#474741] leading-relaxed">
                  Ancient wisdom validated by modern dermatological science.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-[#f9f6f1]/50 border border-[#c8c7be]/10 text-center space-y-2">
                <span className="material-symbols-outlined text-[#596244] text-[32px]">
                  auto_awesome
                </span>
                <h4 className="font-serif text-base text-[#1b1c1c] font-medium">
                  Sustainable Luxury
                </h4>
                <p className="font-sans text-xs text-[#474741] leading-relaxed">
                  100% recyclable glass packaging and carbon-neutral shipping.
                </p>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <aside className="lg:sticky lg:top-32 space-y-6">
            <div className="bg-[#f6f3f2] rounded-xl p-8 border border-[#c8c7be]/20 shadow-sm">
              <h3 className="font-serif text-xl text-[#1b1c1c] mb-6">Order Summary</h3>

              {/* Products List */}
              <div className="space-y-6 mb-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-20 bg-[#f9f6f1] rounded-lg overflow-hidden flex-shrink-0 border border-[#c8c7be]/20">
                      <img
                        alt={item.name}
                        className="w-full h-full object-cover"
                        src={item.image || "/images/lomaras-bottle.jpg"}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuC-vs5ibK-6JoGJDV8iAjgwxkeh6Ge44aTR9kblYI_EDbRnd97Sa90gxROGb80NH_tpRket0UIXewFafpQmXnJoXXE6dwBTJ2Vson634JsyR5XdtnyVD6JJHq8nzZ-Xag1QNRvtyBcMeNeOgO2UJbabSQ7kwpQ4GiZSvTVYRYoZB8l1xN_XdR_uRZvfRMV4etXd3r43gcRCZ1_lrlLvocQr101zPWuwjr1tMy4tDBeEyW6htkNyc5kttAuQQl88adU8wTL1elDsa0Bh";
                        }}
                      />
                      <span className="absolute -top-1 -right-1 bg-stone-700 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-serif text-base text-[#1b1c1c] font-medium leading-tight">
                        {item.name}
                      </h4>
                      <p className="font-sans text-xs text-[#474741] mt-1">
                        Ayurvedic Scalp Ritual
                      </p>
                    </div>
                    <span className="font-sans text-sm font-semibold text-[#1b1c1c]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="flex gap-2 mb-8">
                <input
                  className="flex-grow bg-white border border-[#c8c7be] rounded-lg px-4 py-3 font-sans text-sm focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                  placeholder="Discount code"
                  type="text"
                />
                <button className="bg-[#e5e2dd] text-[#1c1c19] px-6 py-3 rounded-lg font-sans text-sm font-medium hover:bg-stone-300 transition-colors">
                  Apply
                </button>
              </div>

              {/* Pricing Details */}
              <div className="space-y-3 border-t border-[#c8c7be]/20 pt-6">
                <div className="flex justify-between font-sans text-sm text-[#474741]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1b1c1c]">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-[#474741]">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#596244]">Free</span>
                </div>
                <div className="flex justify-between font-sans text-sm text-[#474741]">
                  <span>Taxes</span>
                  <span className="font-semibold text-[#1b1c1c]">{formatCurrency(0)}</span>
                </div>

                <div className="flex justify-between items-baseline pt-4 border-t border-[#c8c7be]/20">
                  <span className="font-serif text-lg text-[#1b1c1c]">Total</span>
                  <div className="text-right">
                    <span className="text-xs text-[#474741] mr-2">INR</span>
                    <span className="font-serif text-2xl font-semibold text-[#1b1c1c]">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ritual Prompt */}
            <div className="p-6 rounded-xl border border-[#596244]/20 bg-[#596244]/5">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#596244]">self_improvement</span>
                <div>
                  <h5 className="font-sans text-sm font-semibold text-[#1b1c1c]">
                    Complimentary Ritual
                  </h5>
                  <p className="font-sans text-xs text-[#474741] mt-1 leading-relaxed">
                    Your order includes a personalized digital guided meditation based on your
                    selected Ayurvedic profile.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f9f6f1] border-t border-[#c8c7be]/30 py-12 px-6 md:px-16 mt-12">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="font-serif text-xl tracking-[0.2em] text-[#1b1c1c] uppercase">
              LIVAARA
            </span>
            <p className="font-sans text-xs text-[#474741]">
              © 2026 LIVAARA. Crafted with Ayurvedic Wisdom.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            <Link
              href="#"
              className="font-sans text-xs text-[#474741] hover:text-[#596244] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="font-sans text-xs text-[#474741] hover:text-[#596244] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="font-sans text-xs text-[#474741] hover:text-[#596244] transition-colors"
            >
              Shipping Information
            </Link>
            <Link
              href="#"
              className="font-sans text-xs text-[#596244] font-semibold hover:opacity-80 transition-opacity flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Secure Checkout
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
