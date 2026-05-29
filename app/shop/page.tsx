import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { getHeroProduct } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = {
  title: "Shop — LIVAARA",
  description: "Explore our collection of authentic Ayurvedic formulations.",
};

export default async function ShopPage() {
  const liveProduct = await getHeroProduct();

  const comingSoonProducts = [
    {
      id: "cs-1",
      name: "Ayurvedic Hair Cleanser",
      type: "Shampoo",
      status: "Coming Soon",
    },
    {
      id: "cs-2",
      name: "Scalp Revitalizing Mask",
      type: "Hair Mask",
      status: "Coming Soon",
    },
    {
      id: "cs-3",
      name: "Nourishing Hair Serum",
      type: "Leave-in Serum",
      status: "Coming Soon",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans text-stone-900 selection:bg-[#C8A96A] selection:text-white">
      <Header shopPrice={liveProduct.price} />

      {/* spacer for fixed header */}
      <div className="h-20 md:h-24"></div>

      <main className="container-px mx-auto max-w-7xl py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-6">
            The Apothecary
          </h1>
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            Formulations rooted in ancient wisdom, crafted for modern rituals.
          </p>
          <div className="w-16 h-[1px] bg-[#C8A96A] mx-auto mt-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Live Product */}
          <Link
            href={`/product/${liveProduct.slug}`}
            className="group flex flex-col bg-white border border-stone-200 rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden block">
              {liveProduct.image_url ? (
                <img
                  src={liveProduct.image_url}
                  alt={liveProduct.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-[#C8A96A]/5 flex items-center justify-center flex-col">
                  <span className="font-serif text-[#C8A96A] text-2xl opacity-30">LIVAARA</span>
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">Scalp Oil</div>
              <h3 className="font-serif text-xl text-stone-900 mb-2 group-hover:text-[#C8A96A] transition-colors line-clamp-2">
                {liveProduct.name}
              </h3>
              <p className="font-medium text-stone-900 mt-auto mb-4">
                ₹{liveProduct.price.toFixed(2)}
              </p>
              <div className="w-full inline-flex items-center justify-center gap-2 border border-stone-900 text-stone-900 uppercase tracking-widest text-xs py-3 rounded-sm group-hover:bg-stone-900 group-hover:text-white transition-colors">
                <Zap size={14} /> Shop Now
              </div>
            </div>
          </Link>

          {/* Coming Soon Products */}
          {comingSoonProducts.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col bg-white/50 border border-stone-200 border-dashed rounded-sm overflow-hidden"
            >
              <div className="relative aspect-[4/5] bg-stone-50/80 flex items-center justify-center">
                <span className="font-serif text-stone-300 text-2xl opacity-50">LIVAARA</span>
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
                  <span className="bg-stone-900 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm">
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow opacity-60">
                <div className="text-xs tracking-widest uppercase text-stone-500 mb-2">
                  {p.type}
                </div>
                <h3 className="font-serif text-xl text-stone-900 mb-2 line-clamp-2">{p.name}</h3>
                <div className="w-full mt-auto inline-flex items-center justify-center border border-stone-300 text-stone-400 uppercase tracking-widest text-xs py-3 rounded-sm cursor-not-allowed">
                  Joining Soon
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
