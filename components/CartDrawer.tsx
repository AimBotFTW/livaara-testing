"use client";

import { useCart } from "@/lib/context/CartContext";
import { useRouter } from "next/navigation";
import { trackCheckoutStarted } from "@/lib/analytics";

export function CartDrawer() {
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, cartTotal } =
    useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleCheckout = () => {
    trackCheckoutStarted(
      cartTotal,
      cartItems.reduce((acc, item) => acc + item.quantity, 0),
    );
    toggleCart(false);
    router.push("/checkout");
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm pointer-events-auto"
        onClick={() => toggleCart(false)}
      />
      <div className="fixed top-0 right-0 z-[9999] w-full max-w-[420px] h-screen bg-[#F8F5F0] flex flex-col shadow-none border-l border-stone-200 overflow-y-auto text-stone-900 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center px-6 h-16 border-b border-stone-200 shrink-0">
          <h2 className="font-serif text-2xl tracking-tight font-medium">Your Cart</h2>
          <button
            type="button"
            onClick={() => toggleCart(false)}
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-stone-200 p-4 shrink-0 text-center space-y-2">
          <p className="font-sans text-xs uppercase tracking-widest text-[#6B8E7E] font-medium">
            Congratulations! Your order qualifies for free shipping.
          </p>
          <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#6B8E7E] w-full" />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center text-stone-500 mt-10">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-stone-200 pb-6">
                {/* Product Image */}
                <div className="w-24 h-32 bg-stone-100 border border-stone-200 rounded-md overflow-hidden flex-shrink-0">
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

                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-serif text-xl leading-tight font-medium">{item.name}</h3>
                    <p className="text-stone-500 text-sm mt-1">{formatCurrency(item.price)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Pill */}
                    <div className="flex items-center border border-stone-300 rounded-full bg-white h-8">
                      <button
                        className="px-3 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        className="px-3 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-widest underline underline-offset-4 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sticky Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-[#F8F5F0] border-t border-stone-200 shrink-0">
            <div className="flex justify-between items-center mb-6">
              <span className="font-sans text-xs uppercase tracking-widest text-stone-500">
                Subtotal
              </span>
              <span className="font-serif text-xl font-medium">{formatCurrency(cartTotal)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-stone-900 text-white font-sans text-sm uppercase tracking-widest py-4 flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Check Out
            </button>
            <p className="text-center text-[10px] text-stone-400 mt-3 uppercase tracking-wider">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
