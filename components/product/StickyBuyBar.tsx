"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/context/CartContext";

export function StickyBuyBar({
  productId,
  productName,
  price,
}: {
  productId: string;
  productName: string;
  price: number;
}) {
  const router = useRouter();
  const { addToCart } = useCart();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8D4B0] bg-[#F7F3EC]">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.22em] text-stone-600">Lomaras</div>
          <div className="font-serif text-lg text-stone-900 truncate">₹{price}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            addToCart({ id: productId, name: productName, price, quantity: 1 });
            router.push("/checkout");
          }}
          className="shrink-0 bg-stone-900 text-white px-6 py-3 text-xs font-semibold tracking-[0.22em] uppercase border border-stone-900 hover:bg-stone-800 transition-colors"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
