"use client";

import { trackWhatsappClicked } from "@/lib/analytics";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-px mx-auto max-w-7xl py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="font-serif text-2xl tracking-[0.2em]">LIVAARA</div>
          <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
            Rooted in 38 years of Vaidya-led Ayurvedic tradition. Crafted for your unique scalp, one
            slow batch at a time.
          </p>
        </div>
        {[
          {
            title: "Explore",
            links: [
              { name: "The Process", href: "/#process" },
              { name: "Botanicals", href: "/#ingredients" },
              { name: "Products", href: "/shop" },
              { name: "Your Ritual", href: "/#ritual" },
            ],
          },
          {
            title: "Products",
            links: [
              { name: "LOMARAS™ Oil", href: "/product/lomaras-ayurvedic-scalp-oil" },
              { name: "Root Revive Shampoo", href: "/shop" },
              { name: "All Products", href: "/shop" },
            ],
          },
          {
            title: "Connect",
            links: [
              <a
                key="instagram"
                href="https://www.instagram.com/livaara__?igsh=MWt1YXljMTh1aDlkdg=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-foreground/80 hover:text-accent transition-colors block"
              >
                Instagram
              </a>,
              <a
                key="whatsapp"
                href="https://wa.me/+918511414551"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsappClicked()}
                className="text-sm text-primary-foreground/80 hover:text-accent transition-colors block"
              >
                WhatsApp Consult
              </a>,
              { name: "Contact", href: "/" },
              { name: "Privacy Policy", href: "/" },
            ],
          },
        ].map((c) => (
          <div key={c.title}>
            <p className="eyebrow mb-5">{c.title}</p>
            <ul className="space-y-3">
              {c.links.map((l, idx) => {
                const isObj = typeof l === "object" && l !== null && "name" in l;
                return (
                  <li key={isObj ? l.name : `link-${idx}`}>
                    {isObj ? (
                      <a
                        href={l.href}
                        className="text-sm text-primary-foreground/80 hover:text-accent transition-colors block"
                      >
                        {l.name}
                      </a>
                    ) : (
                      l
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="container-px mx-auto max-w-7xl py-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-primary-foreground/60">
          <p>© 2025 LIVAARA. All rights reserved.</p>
          <p className="italic">Crafted with intention. Delivered with care.</p>
        </div>
      </div>
    </footer>
  );
}
