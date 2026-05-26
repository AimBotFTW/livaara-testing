import Image from "next/image";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Star, CheckCircle2 } from "lucide-react";
import { getApprovedReviews } from "@/app/actions/reviews";
import { getHeroProduct } from "@/lib/products";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ReviewSectionHeader } from "@/components/product/ReviewSectionHeader";

export default async function ProductPage() {
  const [product, reviews] = await Promise.all([getHeroProduct(), getApprovedReviews()]);

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans text-stone-900 selection:bg-[#C8A96A] selection:text-white">
      <Header shopPrice={599} />

      {/* spacer for fixed header */}
      <div className="h-20 md:h-24"></div>

      {/* 1. PRODUCT HERO */}
      <section className="container-px mx-auto max-w-7xl py-12 md:py-20 lg:py-24">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
          {/* Left: Image */}
          <div className="w-full md:w-1/2">
            <div className="relative aspect-[4/5] bg-stone-100 rounded-xl overflow-hidden shadow-lg border border-stone-200">
              <div className="absolute inset-0 bg-[#C8A96A]/5 flex items-center justify-center flex-col">
                <span className="font-serif text-[#C8A96A] text-6xl opacity-30 mb-4">LIVAARA</span>
                <p className="text-stone-400 text-sm font-medium tracking-widest uppercase">
                  Product Image
                </p>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="w-full md:w-1/2 flex flex-col pt-4 md:pt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-[#C8A96A]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span className="text-sm text-stone-500 underline underline-offset-4 cursor-pointer">
                128 Reviews
              </span>
            </div>

            <h1 className="font-serif text-4xl lg:text-5xl font-medium leading-tight mb-4 text-stone-900">
              Lomaras™ Ayurvedic Scalp Oil
            </h1>

            <p className="text-2xl font-serif text-stone-800 mb-6">₹{product.price.toFixed(2)}</p>

            <div className="w-12 h-[1px] bg-[#C8A96A] mb-8"></div>

            <p className="text-stone-600 leading-relaxed mb-10 text-lg">
              Cold-infused over seven slow days. Crafted with Ashwagandha, Bhringraj, and Rosemary
              in amber glass. Formulated by a Vaidya who spent four decades studying scalps, to
              stimulate growth and nourish roots from within.
            </p>

            <AddToCartButton
              productId={product.id}
              productName={product.name}
              price={product.price}
            />

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-md flex items-start gap-4">
              <div className="text-[#C8A96A] mt-1">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-medium text-stone-900 text-sm mb-1">Authentic Formulation</p>
                <p className="text-stone-500 text-xs leading-relaxed">
                  Rooted in ancient Ayurvedic texts. Free from parabens, sulfates, and synthetic
                  fragrances. 100% natural and cruelty-free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INGREDIENT SPOTLIGHT */}
      <section className="bg-white border-y border-stone-200 py-20 md:py-32">
        <div className="container-px mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">
              Golden Ingredients
            </h2>
            <p className="text-stone-500">
              The purest botanical extracts sourced directly from traditional farms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#F8F5F0] border border-[#C8A96A]/30 mb-6 flex items-center justify-center p-4">
                <div className="w-full h-full rounded-full border border-dashed border-[#C8A96A] flex items-center justify-center text-[#C8A96A] text-xs font-serif uppercase tracking-widest">
                  Ashwa
                </div>
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-3">Ashwagandha</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Known as Indian Ginseng, it drastically reduces cortisol levels on the scalp. This
                actively prevents stress-induced hair thinning and shedding.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#F8F5F0] border border-[#C8A96A]/30 mb-6 flex items-center justify-center p-4">
                <div className="w-full h-full rounded-full border border-dashed border-[#C8A96A] flex items-center justify-center text-[#C8A96A] text-xs font-serif uppercase tracking-widest">
                  Bhrin
                </div>
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-3">Bhringraj</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                The literal 'King of Hair' in Ayurveda. It awakens dormant hair follicles,
                accelerating natural growth and restoring deep luster to dull strands.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#F8F5F0] border border-[#C8A96A]/30 mb-6 flex items-center justify-center p-4">
                <div className="w-full h-full rounded-full border border-dashed border-[#C8A96A] flex items-center justify-center text-[#C8A96A] text-xs font-serif uppercase tracking-widest">
                  Rose
                </div>
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-3">Rosemary</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                A potent vasodilator that increases blood circulation to the scalp. It delivers
                critical oxygen and nutrients directly to the hair roots.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE RITUAL */}
      <section className="py-20 md:py-32 container-px mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">The Ritual</h2>
          <p className="text-stone-500">
            For maximum efficacy, follow this ancient practice twice weekly.
          </p>
        </div>

        <div className="flex flex-col md:flex-row relative">
          {/* Connecting Line Desktop */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-[1px] bg-stone-300 z-0"></div>

          <div className="flex-1 flex flex-col items-center text-center relative z-10 mb-12 md:mb-0 px-6">
            <div className="w-24 h-24 bg-[#F8F5F0] border border-stone-300 rounded-full flex items-center justify-center font-serif text-3xl text-[#C8A96A] mb-6 shadow-sm">
              1
            </div>
            <h4 className="font-serif text-xl text-stone-900 mb-2">Part & Apply</h4>
            <p className="text-stone-500 text-sm">
              Part hair into sections. Apply oil directly to the scalp using the dropper.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center relative z-10 mb-12 md:mb-0 px-6">
            <div className="w-24 h-24 bg-[#F8F5F0] border border-stone-300 rounded-full flex items-center justify-center font-serif text-3xl text-[#C8A96A] mb-6 shadow-sm">
              2
            </div>
            <h4 className="font-serif text-xl text-stone-900 mb-2">Massage Deeply</h4>
            <p className="text-stone-500 text-sm">
              Vigorously massage into roots with fingertips for 5-10 minutes to stimulate blood
              flow.
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center text-center relative z-10 px-6">
            <div className="w-24 h-24 bg-[#F8F5F0] border border-stone-300 rounded-full flex items-center justify-center font-serif text-3xl text-[#C8A96A] mb-6 shadow-sm">
              3
            </div>
            <h4 className="font-serif text-xl text-stone-900 mb-2">Leave Overnight</h4>
            <p className="text-stone-500 text-sm">
              Allow the botanicals to infuse overnight before washing out with a gentle cleanser.
            </p>
          </div>
        </div>
      </section>

      {/* 4. CUSTOMER REVIEWS */}
      <section className="bg-stone-100 border-t border-stone-200 py-20 md:py-24">
        <div className="container-px mx-auto max-w-7xl">
          <ReviewSectionHeader productId={product.id} />

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500 font-serif text-xl">
                No reviews yet. Be the first to experience the ritual.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((r) => (
                <ReviewCard
                  key={r.id}
                  name={r.customer_name ?? "Anonymous"}
                  date={new Date(r.created_at).toLocaleDateString()}
                  title={r.rating === 5 ? "Luxurious ritual" : "Beautiful product"}
                  content={r.review_text}
                  rating={r.rating}
                  isVerified={r.is_verified_purchase}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ReviewCard({
  name,
  date,
  title,
  content,
  rating,
  isVerified,
}: {
  name: string;
  date: string;
  title: string;
  content: string;
  rating: number;
  isVerified: boolean;
}) {
  return (
    <div className="bg-white p-8 border border-stone-200 shadow-sm rounded-sm flex flex-col h-full">
      <div className="flex items-center gap-1 text-[#C8A96A] mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} />
        ))}
      </div>
      <h4 className="font-serif text-lg text-stone-900 mb-2 font-medium">{title}</h4>
      <p className="text-stone-600 text-sm leading-relaxed mb-6 flex-grow">"{content}"</p>

      <div className="pt-4 border-t border-stone-100 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-medium text-stone-900 text-sm flex items-center gap-2">
              {name}
            </span>
            <span className="text-stone-400 text-xs mt-1">{date}</span>
          </div>
          {isVerified && (
            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-2 py-1 rounded">
              <CheckCircle2 size={12} className="text-[#C8A96A]" />
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">
                Verified
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
