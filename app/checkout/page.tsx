"use client";

import { useCart } from "@/lib/context/CartContext";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { trackPaymentSuccess } from "@/lib/analytics";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutFormSchema, CheckoutFormData } from "@/lib/validations/checkout";

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
  const { cartItems, cartTotal, toggleCart, clearCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const honeypotRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const pincodeValue = watch("pincode");

  useEffect(() => {
    if (!pincodeValue) return;
    if (!/^[1-9]\d{5}$/.test(pincodeValue)) return;

    const handler = setTimeout(async () => {
      setIsFetchingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincodeValue}`);
        if (!res.ok) return;
        const data = await res.json();

        if (
          data &&
          data[0] &&
          data[0].Status === "Success" &&
          data[0].PostOffice &&
          data[0].PostOffice.length > 0
        ) {
          const postOffice = data[0].PostOffice[0];
          const apiState = postOffice.State;
          const apiDistrict = postOffice.District;

          if (apiDistrict) {
            setValue("city", apiDistrict, { shouldValidate: true, shouldDirty: true });
          }

          if (apiState) {
            const STATE_NAME_MAP: Record<string, string> = {
              "Andaman & Nicobar Islands": "Andaman and Nicobar Islands",
              "Andaman And Nicobar Islands": "Andaman and Nicobar Islands",
              "Dadra & Nagar Haveli": "Dadra and Nagar Haveli and Daman and Diu",
              "Dadra and Nagar Haveli": "Dadra and Nagar Haveli and Daman and Diu",
              "Daman & Diu": "Dadra and Nagar Haveli and Daman and Diu",
              "Jammu & Kashmir": "Jammu and Kashmir",
              "NCT of Delhi": "Delhi",
            };

            const resolved = STATE_NAME_MAP[apiState] ?? apiState;

            const VALID_STATES = [
              "Andhra Pradesh",
              "Arunachal Pradesh",
              "Assam",
              "Bihar",
              "Chhattisgarh",
              "Goa",
              "Gujarat",
              "Haryana",
              "Himachal Pradesh",
              "Jharkhand",
              "Karnataka",
              "Kerala",
              "Madhya Pradesh",
              "Maharashtra",
              "Manipur",
              "Meghalaya",
              "Mizoram",
              "Nagaland",
              "Odisha",
              "Punjab",
              "Rajasthan",
              "Sikkim",
              "Tamil Nadu",
              "Telangana",
              "Tripura",
              "Uttar Pradesh",
              "Uttarakhand",
              "West Bengal",
              "Andaman and Nicobar Islands",
              "Chandigarh",
              "Dadra and Nagar Haveli and Daman and Diu",
              "Delhi",
              "Jammu and Kashmir",
              "Ladakh",
              "Lakshadweep",
              "Puducherry",
            ];

            if (VALID_STATES.includes(resolved)) {
              setValue("state", resolved as CheckoutFormData["state"], {
                shouldValidate: true,
                shouldDirty: true,
              });
            }
          }
        }
      } catch (err) {
        // Fail silently
      } finally {
        setIsFetchingPincode(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [pincodeValue, setValue]);

  const onSubmit = async (data: CheckoutFormData) => {
    const validItems = cartItems.filter((item) => item.quantity > 0);
    if (validItems.length === 0) return toast.error("Your cart is empty");

    setIsProcessing(true);

    const formData = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName || "",
      address: data.address,
      apartment: data.apartment || "",
      city: data.city,
      state: data.state,
      pinCode: data.pincode,
      phone: data.phone,
    };

    const websiteValue = honeypotRef.current?.value || "";

    if (paymentMethod === "cod") {
      try {
        const res = await fetch("/api/checkout/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItems: validItems, formData, website: websiteValue }),
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Failed to create order");

        clearCart();
        toggleCart(false);
        if (resData.orderNumber) {
          router.push(`/order-success?id=${resData.orderId}&order_number=${resData.orderNumber}`);
        } else {
          router.push(`/order-success?id=${resData.orderId}`);
        }
      } catch (err) {
        console.error("COD Checkout Error:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to place order. Please try again.",
        );
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    try {
      // 1. Create Razorpay Order on Backend
      const res = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems: validItems, formData, website: websiteValue }),
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
            // Webhook handles the actual database update and emails asynchronously
            trackPaymentSuccess(order.internalOrderId, order.amount / 100);

            clearCart();
            toggleCart(false);
            if (order.internalOrderNumber) {
              router.push(
                `/order-success?id=${order.internalOrderId}&order_number=${order.internalOrderNumber}`,
              );
            } else {
              router.push(`/order-success?id=${order.internalOrderId}`);
            }
          } catch (err) {
            console.error("Order redirect error:", err);
            toast.success("Payment successful! Redirecting to your order.");
          }
        },
        prefill: {
          name: `${data.firstName} ${data.lastName || ""}`.trim(),
          email: data.email,
          contact: data.phone,
        },
        theme: {
          color: "#596244", // Deep sage green
        },
      };

      const rzp = new window.Razorpay(options as unknown as Record<string, unknown>);
      rzp.on("payment.failed", function (response: { error: { description: string } }) {
        console.error("Payment Failed:", response.error);
        toast.error("Payment failed! Please try again.");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to initiate payment";
      if (msg === "Invalid phone number") {
        toast.error("Invalid phone number");
      } else if (msg === "Invalid pincode") {
        toast.error("Invalid pincode");
      } else if (msg === "Insufficient inventory for product") {
        toast.error("Sorry, this item is out of stock");
      } else {
        toast.error(msg);
      }
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
        <div className="flex justify-between items-center w-full px-4 md:px-6 py-4 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="hover:opacity-80 transition-opacity duration-300 active:scale-95 duration-200 flex items-center"
            >
              <span className="material-symbols-outlined text-[#596244]">arrow_back</span>
            </Link>
            <Link href="/">
              <h1 className="font-serif text-xl md:text-2xl text-[#1b1c1c] tracking-[0.2em] uppercase">
                LIVAARA
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-6">
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
      <main className="max-w-[1200px] w-full mx-auto px-4 md:px-16 py-8 md:py-12 flex-grow">
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
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">
          {/* Left Column: Form */}
          <div className="space-y-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              <input
                type="text"
                name="website"
                ref={honeypotRef}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Contact Section */}
              <section className="space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email or mobile phone number"
                    {...register("email")}
                    className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
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
                    <div className="w-full border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base text-[#1b1c1c] flex items-center justify-between">
                      <span>India</span>
                      <span className="text-xs text-[#474741]/60">Shipping within India only</span>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="First name"
                      {...register("firstName")}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Last name (optional)"
                      {...register("lastName")}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 relative">
                    <input
                      type="text"
                      placeholder="Address"
                      {...register("address")}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2 relative">
                    <input
                      type="text"
                      placeholder="Apartment, suite, etc. (optional)"
                      {...register("apartment")}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                    />
                    {errors.apartment && (
                      <p className="mt-1 text-sm text-red-600">{errors.apartment.message}</p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="City"
                      {...register("city")}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                    <div className="relative">
                      <select
                        {...register("state")}
                        className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors text-[#1b1c1c] appearance-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select your state
                        </option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Andaman and Nicobar Islands">
                          Andaman and Nicobar Islands
                        </option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Dadra and Nagar Haveli and Daman and Diu">
                          Dadra and Nagar Haveli and Daman and Diu
                        </option>
                        <option value="Delhi">Delhi</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Puducherry">Puducherry</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-[#c8c7be] pointer-events-none">
                        expand_more
                      </span>
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="PIN / ZIP code"
                          {...register("pincode")}
                          className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                        />
                        {isFetchingPincode && (
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 font-sans text-[10px] uppercase tracking-wider text-[#596244]/70">
                            Fetching...
                          </span>
                        )}
                      </div>
                      {errors.pincode && (
                        <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 relative">
                    <input
                      type="tel"
                      placeholder="Phone number"
                      {...register("phone")}
                      className="w-full bg-transparent border-0 border-b border-[#c8c7be] py-4 px-0 font-sans text-base focus:border-[#596244] focus:ring-0 focus:outline-none transition-colors placeholder-stone-400 text-[#1b1c1c]"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="pt-6 border-t border-[#c8c7be]/20">
                  <h2 className="font-serif text-2xl text-[#1b1c1c] mb-6">Payment Method</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("razorpay")}
                      className={`p-4 border rounded-sm text-left transition-colors flex items-center justify-between ${
                        paymentMethod === "razorpay"
                          ? "border-[#596244] bg-[#596244]/5"
                          : "border-[#c8c7be]/50 bg-transparent hover:border-[#596244]/50"
                      }`}
                    >
                      <span className="font-sans text-sm font-medium text-[#1b1c1c]">
                        Online Payment (Razorpay)
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "razorpay" ? "border-[#596244]" : "border-[#c8c7be]"
                        }`}
                      >
                        {paymentMethod === "razorpay" && (
                          <div className="w-2 h-2 rounded-full bg-[#596244]" />
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 border rounded-sm text-left transition-colors flex items-center justify-between ${
                        paymentMethod === "cod"
                          ? "border-[#596244] bg-[#596244]/5"
                          : "border-[#c8c7be]/50 bg-transparent hover:border-[#596244]/50"
                      }`}
                    >
                      <span className="font-sans text-sm font-medium text-[#1b1c1c]">
                        Cash on Delivery (+₹40)
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "cod" ? "border-[#596244]" : "border-[#c8c7be]"
                        }`}
                      >
                        {paymentMethod === "cod" && (
                          <div className="w-2 h-2 rounded-full bg-[#596244]" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Razorpay Banner Info */}
                {paymentMethod === "razorpay" && (
                  <div className="mt-8 border border-[#596244]/20 rounded-sm p-6 bg-[#596244]/5 space-y-2">
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
                )}

                <div className="pt-6 flex flex-col-reverse md:flex-row items-center justify-between gap-6">
                  <Link
                    href="/shop"
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
                    {isProcessing
                      ? "PROCESSING..."
                      : paymentMethod === "cod"
                        ? `PLACE ORDER — ${formatCurrency(cartTotal + 40)}`
                        : `PAY NOW (${formatCurrency(cartTotal)})`}
                  </button>
                </div>
              </section>
            </form>

            {/* Trust Badges */}
            <section className="pt-12 border-t border-[#c8c7be]/20 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-sm bg-[#f9f6f1]/50 border border-[#c8c7be]/10 text-center space-y-2">
                <span className="material-symbols-outlined text-[#596244] text-[32px]">eco</span>
                <h4 className="font-serif text-base text-[#1b1c1c] font-medium">Pure Botanicals</h4>
                <p className="font-sans text-xs text-[#474741] leading-relaxed">
                  Sourced from organic Himalayan foothills for maximum potency.
                </p>
              </div>
              <div className="p-6 rounded-sm bg-[#f9f6f1]/50 border border-[#c8c7be]/10 text-center space-y-2">
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
              <div className="p-6 rounded-sm bg-[#f9f6f1]/50 border border-[#c8c7be]/10 text-center space-y-2">
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
            <div className="bg-[#f6f3f2] rounded-sm p-8 border border-[#c8c7be]/20 shadow-none">
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
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-serif text-base text-[#1b1c1c] font-medium leading-tight">
                        {item.name}
                      </h4>
                      <p className="font-sans text-xs text-[#474741] mt-1 mb-2">
                        Ayurvedic Scalp Ritual
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-[#c8c7be] rounded-md overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="px-2 py-1 text-[#474741] hover:bg-[#f6f3f2] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <span className="px-2 font-sans text-xs font-medium text-[#1b1c1c] w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-[#474741] hover:bg-[#f6f3f2] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 0)}
                          className="text-xs text-[#474741] hover:text-red-500 underline decoration-[#474741]/30 hover:decoration-red-500 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <span className="font-sans text-sm font-semibold text-[#1b1c1c]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Details */}
              <div className="space-y-3 border-t border-[#c8c7be]/20 pt-6">
                <div className="flex justify-between font-sans text-sm text-[#474741]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1b1c1c]">{formatCurrency(cartTotal)}</span>
                </div>
                {paymentMethod === "cod" && (
                  <div className="flex justify-between font-sans text-sm text-[#474741]">
                    <span>COD Charges</span>
                    <span className="font-semibold text-[#1b1c1c]">{formatCurrency(40)}</span>
                  </div>
                )}
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
                      {formatCurrency(paymentMethod === "cod" ? cartTotal + 40 : cartTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ritual Prompt */}
            <div className="p-6 rounded-sm border border-[#596244]/20 bg-[#596244]/5">
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
      <footer className="w-full bg-[#f9f6f1] border-t border-[#c8c7be]/30 py-12 px-4 md:px-16 mt-12">
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
              href="/privacy"
              className="font-sans text-xs text-[#474741] hover:text-[#596244] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-sans text-xs text-[#474741] hover:text-[#596244] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/"
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
