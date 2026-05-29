"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { trackAddToCart } from "@/lib/analytics";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  isCartOpen: boolean;
  heroProduct: { id: string; name: string; price: number } | null;
  addToCart: (item: CartItem, openCart?: boolean) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  toggleCart: (isOpen: boolean) => void;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  initialHeroProduct,
}: {
  children: ReactNode;
  initialHeroProduct?: { id: string; name: string; price: number };
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [heroProduct] = useState(initialHeroProduct || null);

  const addToCart = (item: CartItem, openCart = true) => {
    trackAddToCart();
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
        );
      }
      return [...prev, item];
    });
    if (openCart) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i)),
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleCart = (isOpen: boolean) => {
    setIsCartOpen(isOpen);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        heroProduct,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
