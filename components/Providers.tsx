"use client";

import { CartProvider } from "@/lib/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { ReactNode } from "react";

export function Providers({
  children,
  initialHeroProduct,
}: {
  children: ReactNode;
  initialHeroProduct?: { id: string; name: string; price: number };
}) {
  return (
    <CartProvider initialHeroProduct={initialHeroProduct}>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
