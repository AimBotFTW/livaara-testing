"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  clearCart: () => void;
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
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("livaara_cart");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (err) {
        console.error("Failed to parse cart from localStorage:", err);
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [heroProduct] = useState(initialHeroProduct || null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("livaara_cart", JSON.stringify(cartItems));
      } catch (err) {
        console.error("Failed to save cart to localStorage:", err);
      }
    }
  }, [cartItems]);

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
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleCart = (isOpen: boolean) => {
    setIsCartOpen(isOpen);
  };

  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("livaara_cart");
      } catch (err) {
        console.error("Failed to clear cart from localStorage:", err);
      }
    }
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
        clearCart,
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
