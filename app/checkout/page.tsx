"use client";

import { useCart } from "@/lib/context/CartContext";
import { useState, FormEvent } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { processCheckoutSuccessAction, type CheckoutFormData } from "@/app/actions/checkout";
import { trackPaymentSuccess } from "@/lib/analytics";

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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use NEXT_PUBLIC if you expose key on client, or leave blank to let backend handle, wait Razorpay JS requires the public key here. Wait, I should add NEXT_PUBLIC_RAZORPAY_KEY_ID to the plan or just use it.
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
              // Payment processed & order successfully created in our DB
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
          color: "#2C1E1A", // stone-900
        },
      };

      const rzp = new window.Razorpay(options);
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

  const inputClass =
    "w-full bg-white border border-stone-300 rounded-md px-4 py-3 font-sans text-stone-900 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-colors mt-1";
  const labelClass = "font-sans text-sm text-stone-600 block";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans text-stone-900">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* LEFT COLUMN: FORM */}
      <div className="w-full md:w-1/2 lg:w-3/5 bg-white xl:pl-40 lg:pl-20 md:pl-10 px-6 py-12 md:py-16">
        <div className="max-w-xl mx-auto md:mx-0 md:ml-auto md:pr-10">
          <div className="mb-8">
            <Link href="/" className="font-serif text-3xl tracking-wide font-medium">
              LIVAARA
            </Link>
          </div>

          <form className="space-y-10" onSubmit={handlePayment}>
            {/* Contact Section */}
            <section>
              <h2 className="font-serif text-2xl font-medium mb-4">Contact</h2>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email or mobile phone number"
                  className={inputClass}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </section>

            {/* Delivery Section */}
            <section>
              <h2 className="font-serif text-2xl font-medium mb-4">Delivery</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className={labelClass}>First name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="w-1/2">
                    <label className={labelClass}>Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Apartment, suite, etc. (optional)</label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className={labelClass}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="w-1/3">
                    <label className={labelClass}>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="w-1/3">
                    <label className={labelClass}>PIN Code</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Payment Section - UI Only */}
            <section>
              <h2 className="font-serif text-2xl font-medium mb-4">Payment</h2>
              <p className="text-stone-500 text-sm mb-4">
                All transactions are secure and encrypted.
              </p>
              <div className="border border-stone-300 rounded-md p-4 bg-stone-50">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-4 border-stone-900 bg-white"></div>
                  <span className="font-medium">Razorpay (Cards, UPI, NetBanking)</span>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-stone-900 text-white font-sans text-lg font-medium py-5 rounded-md hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
            >
              {isProcessing ? "PROCESSING..." : `PAY NOW (${formatCurrency(cartTotal)})`}
            </button>
          </form>

          <div className="mt-12 border-t border-stone-200 pt-6 flex justify-between text-xs text-stone-500">
            <Link href="#" className="hover:text-stone-900 underline underline-offset-4">
              Refund policy
            </Link>
            <Link href="#" className="hover:text-stone-900 underline underline-offset-4">
              Shipping policy
            </Link>
            <Link href="#" className="hover:text-stone-900 underline underline-offset-4">
              Privacy policy
            </Link>
            <Link href="#" className="hover:text-stone-900 underline underline-offset-4">
              Terms of service
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: SUMMARY */}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-[#F8F5F0] border-t md:border-t-0 md:border-l border-stone-200 px-6 py-12 md:py-16 xl:pr-40 lg:pr-20 md:pr-10 border-l border-stone-200">
        <div className="max-w-md mx-auto md:mx-0 md:mr-auto md:pl-10">
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                {/* Product Thumbnail with Badge */}
                <div className="relative w-16 h-16 bg-white border border-stone-200 rounded-md flex-shrink-0">
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-stone-500 text-white text-xs flex items-center justify-center rounded-full font-medium">
                    {item.quantity}
                  </div>
                </div>

                <div className="flex-grow">
                  <h4 className="font-serif text-lg font-medium leading-tight">{item.name}</h4>
                </div>

                <div className="text-stone-900 font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200 space-y-4">
            <div className="flex justify-between items-center text-stone-600">
              <span>Subtotal</span>
              <span className="font-medium text-stone-900">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-stone-600">
              <span>Shipping</span>
              <span className="font-medium text-[#6B8E7E]">Free</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-200 flex justify-between items-end">
            <span className="font-sans text-lg">Total</span>
            <span className="font-serif text-3xl font-medium text-stone-900">
              <span className="text-stone-500 text-sm font-sans font-normal mr-2">INR</span>
              {formatCurrency(cartTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
