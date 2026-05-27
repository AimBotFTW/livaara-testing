"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/CartContext";
import { Minus, Plus, ShoppingBag, MessageCircle, Zap } from "lucide-react";
import { trackShopNowClick } from "@/lib/analytics";

const WA_URL =
  "https://wa.me/919999999999?text=Hi!%20I'd%20like%20to%20claim%20my%20Free%20Dosha%20Consultation.";

interface ProductHeroActionsProps {
  productId: string;
  productName?: string;
  price?: number;
}

export function ProductHeroActions({
  productId,
  productName = "Lomaras™ Ayurvedic Scalp Oil",
  price = 599,
}: ProductHeroActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const { addToCart, toggleCart } = useCart();
  const router = useRouter();

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => q + 1);

  const handleAddToCart = () => {
    trackShopNowClick();
    addToCart({ id: productId, name: productName, price, quantity });
    toggleCart(true);
  };

  const handleBuyNow = async () => {
    if (buying) return;
    setBuying(true);
    trackShopNowClick();
    addToCart({ id: productId, name: productName, price, quantity: 1 });
    router.push("/checkout");
  };

  return (
    <>
      {/* ── Quantity + Add-to-Cart ── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <div className="flex items-center justify-between border border-stone-300 rounded-md px-4 py-3 bg-white w-full sm:w-32">
          <button
            onClick={decrement}
            aria-label="Decrease quantity"
            className="text-stone-400 hover:text-stone-900 transition-colors"
          >
            <Minus size={18} />
          </button>
          <span className="font-medium text-stone-900">{quantity}</span>
          <button
            onClick={increment}
            aria-label="Increase quantity"
            className="text-stone-400 hover:text-stone-900 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        <button
          id="add-to-cart-btn"
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 bg-stone-900 text-white font-medium tracking-widest uppercase text-sm rounded-md py-4 hover:bg-stone-800 transition-colors shadow-xl shadow-stone-900/10"
        >
          <ShoppingBag size={16} />
          Add To Bag
        </button>
      </div>

      {/* ── Secondary CTA row: Dosha Consult + Buy Now ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        {/* WhatsApp Dosha Consult */}
        <a
          id="dosha-consult-btn"
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 border border-[#C8A96A] text-[#C8A96A] font-medium tracking-wider uppercase text-sm rounded-md py-3.5 hover:bg-[#C8A96A]/8 transition-all duration-200"
        >
          <MessageCircle size={16} />
          Free Dosha Consult
        </a>

        {/* High-contrast Buy Now */}
        <button
          id="buy-now-btn"
          onClick={handleBuyNow}
          disabled={buying}
          className="flex-1 flex items-center justify-center gap-2 bg-[#C8A96A] text-white font-semibold tracking-widest uppercase text-sm rounded-md py-3.5 hover:bg-[#b8954f] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#C8A96A]/30 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Zap size={16} className={buying ? "animate-pulse" : ""} />
          {buying ? "Redirecting…" : `Buy Now — ₹${price}`}
        </button>
      </div>

      {/* ── Mobile Sticky CTA Bar (md:hidden) ── */}
      <div
        id="mobile-sticky-cta"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 flex gap-3 shadow-2xl"
      >
        <a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 border border-[#C8A96A] text-[#C8A96A] font-medium text-xs tracking-wider uppercase rounded-md py-3.5 hover:bg-[#C8A96A]/8 transition-colors"
        >
          <MessageCircle size={14} />
          Free Consult
        </a>
        <button
          onClick={handleBuyNow}
          disabled={buying}
          className="flex-[2] flex items-center justify-center gap-1.5 bg-[#C8A96A] text-white font-semibold text-sm tracking-widest uppercase rounded-md py-3.5 hover:bg-[#b8954f] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#C8A96A]/25 disabled:opacity-70"
        >
          <Zap size={14} className={buying ? "animate-pulse" : ""} />
          {buying ? "Going…" : `Buy Now — ₹${price}`}
        </button>
      </div>
    </>
  );
}
