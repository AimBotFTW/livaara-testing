import Image from "next/image";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { InteractiveBotanicals } from "@/components/InteractiveBotanicals";
import { getHeroProduct } from "@/lib/products";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";

import { ReviewSection } from "@/components/product/ReviewSection";

export default async function LomarasProductPage() {
  const product = await getHeroProduct();

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans text-stone-900">
      <Header shopPrice={product.price} />

      {/* spacer for fixed header */}
      <div className="h-20 md:h-24" />

      <main className="container-px mx-auto max-w-7xl pb-28">
        {/* Hero */}
        <section className="py-12 md:py-16 border-b border-[#E8D4B0]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="border border-[#E8D4B0] bg-[#F7F3EC] aspect-[4/5] relative overflow-hidden">
              <Image
                src="/images/lomaras-bottle.jpg"
                alt={product.name}
                width={1024}
                height={1280}
                className="w-full h-full object-cover object-bottom"
              />
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-stone-600">
                  Lomaras™ System
                </div>
                <h1 className="font-serif text-4xl md:text-5xl leading-tight mt-3">
                  Cold-infused scalp ritual, engineered by tradition.
                </h1>
              </div>

              <div className="border-t border-[#E8D4B0] pt-6">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-stone-600">Price</div>
                    <div className="font-serif text-3xl text-stone-900">₹{product.price}</div>
                  </div>
                  <div className="text-xs uppercase tracking-[0.28em] text-stone-500">
                    In stock: {product.inventory_count}
                  </div>
                </div>
              </div>

              <p className="text-stone-700 leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { k: "Infusion", v: "7 days cold-process" },
                  { k: "Focus", v: "Follicle stimulation" },
                  { k: "Profile", v: "Botanical triad" },
                ].map((x) => (
                  <div key={x.k} className="border border-[#E8D4B0] bg-white p-4">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                      {x.k}
                    </div>
                    <div className="text-sm font-semibold text-stone-900 mt-2">{x.v}</div>
                  </div>
                ))}
              </div>

              <div className="border border-[#E8D4B0] bg-white p-5">
                <div className="text-[11px] uppercase tracking-[0.28em] text-stone-500">
                  Protocol
                </div>
                <ol className="mt-3 space-y-2 text-sm text-stone-700">
                  <li>1. Part hair and apply directly to scalp.</li>
                  <li>2. Massage 5–10 minutes to increase circulation.</li>
                  <li>3. Leave overnight; wash gently.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Ingredients / Botanical network */}
        <section className="py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-stone-600">
              Ingredients Intelligence
            </div>
            <h2 className="font-serif text-3xl md:text-4xl mt-3">Botanical system, mapped.</h2>
            <p className="text-stone-600 mt-4 leading-relaxed">
              Explore the ingredient network below. Each node is a single botanical with a defined
              role in the overall scalp protocol.
            </p>
          </div>

          <div className="mt-10">
            <InteractiveBotanicals />
          </div>
        </section>

        {/* Reviews Section */}
        <ReviewSection productId={product.id} />
      </main>

      <Footer />

      <StickyBuyBar productId={product.id} productName={product.name} price={product.price} />
    </div>
  );
}
