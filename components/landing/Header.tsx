"use client";

import { useEffect, useState } from "react";
import { NAV } from "./nav";
import { formatInr } from "@/lib/utils";
import { useCart } from "@/lib/context/CartContext";
import { trackShopNowClick } from "@/lib/analytics";

type HeaderProps = {
  shopPrice?: number;
};

export function Header({ shopPrice = 599 }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const { toggleCart, addToCart } = useCart();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      let current = "";
      for (const n of NAV) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top < 120) current = n.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/85 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="container-px mx-auto max-w-7xl flex items-center justify-between h-16 md:h-20">
        <a href="#top" className="font-serif text-xl md:text-2xl tracking-[0.2em] text-primary">
          LIVAARA
        </a>
        <nav className="hidden md:flex items-center gap-9">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={`text-xs uppercase tracking-[0.18em] transition-colors ${
                active === n.id ? "text-accent" : "text-primary/70 hover:text-primary"
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              trackShopNowClick();
              addToCart({
                id: "a0000000-0000-4000-8000-000000000001",
                name: "Lomaras™ Ayurvedic Scalp Oil",
                price: shopPrice,
                quantity: 1,
              });
              toggleCart(true);
            }}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-xs uppercase tracking-[0.18em] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-sm"
          >
            Shop Now
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-primary p-2"
            aria-label="Menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-px mx-auto py-4 flex flex-col gap-4">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setOpen(false)}
                className="text-sm uppercase tracking-[0.18em] text-primary/80"
              >
                {n.label}
              </a>
            ))}
            <button
              onClick={() => {
                trackShopNowClick();
                setOpen(false);
                addToCart({
                  id: "a0000000-0000-4000-8000-000000000001",
                  name: "Lomaras™ Ayurvedic Scalp Oil",
                  price: shopPrice,
                  quantity: 1,
                });
                toggleCart(true);
              }}
              className="mt-2 inline-flex items-center justify-center px-5 py-3 text-xs uppercase tracking-[0.18em] bg-primary text-primary-foreground rounded-sm"
            >
              Shop Now — {formatInr(shopPrice)}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
