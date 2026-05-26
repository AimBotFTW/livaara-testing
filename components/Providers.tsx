"use client";

import { CartProvider } from "@/lib/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
