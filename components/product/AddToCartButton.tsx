"use client";

import { useState } from "react";
import { useCart } from "@/lib/context/CartContext";
import { Minus, Plus } from "lucide-react";
import { trackShopNowClick } from "@/lib/analytics";

export function AddToCartButton({ price = 599 }: { price?: number }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleCart } = useCart();

  const handleAddToCart = () => {
    trackShopNowClick();
    addToCart({
      id: "00000000-0000-0000-0000-000000000001",
      name: "Lomaras™ Ayurvedic Scalp Oil",
      price,
      quantity,
    });
    toggleCart(true);
  };

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => q + 1);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-10">
      <div className="flex items-center justify-between border border-stone-300 rounded-md px-4 py-3 bg-white w-full sm:w-32">
        <button
          onClick={decrement}
          className="text-stone-400 hover:text-stone-900 transition-colors"
        >
          <Minus size={18} />
        </button>
        <span className="font-medium text-stone-900">{quantity}</span>
        <button
          onClick={increment}
          className="text-stone-400 hover:text-stone-900 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        className="flex-1 bg-stone-900 text-white font-medium tracking-widest uppercase text-sm rounded-md py-4 hover:bg-stone-800 transition-colors shadow-xl shadow-stone-900/10"
      >
        Add To Bag
      </button>
    </div>
  );
}
