"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types/database";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Plus } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";

// Local reels (static assets in /public/videos)
const VIDEOS = [
  { id: "1", src: "/videos/reel-1.mp4" },
  { id: "2", src: "/videos/reel-2.mp4" },
  { id: "3", src: "/videos/reel-3.mp4" },
  { id: "4", src: "/videos/reel-4.mp4" },
  { id: "5", src: "/videos/reel-5.mp4" },
  { id: "6", src: "/videos/reel-6.mp4" },
];

function VideoCard({ src, product }: { src: string; product: Product }) {
  const [isMuted, setIsMuted] = useState(true);
  const { addToCart, toggleCart } = useCart();
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    toggleCart(true); // Open the cart side-drawer
  };

  return (
    <div className="snap-center shrink-0 w-[300px] h-[520px] rounded-2xl overflow-hidden bg-[#1a1a1a] relative group shadow-sm hover:shadow-md transition-shadow">
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="object-cover w-full h-full"
      />

      {/* Mute Toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors z-10"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>

      {/* Shoppable Product Card Overlay */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 shadow-lg z-10">
        <div className="w-12 h-12 shrink-0 bg-[#E8D4B0]/40 rounded-lg overflow-hidden relative flex items-center justify-center">
          <Image
            src="/images/hero.jpg"
            alt="Product thumbnail"
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-stone-900 font-serif text-xs font-medium truncate"
            title={product.name}
          >
            {product.name}
          </p>
          <p className="text-stone-500 text-[11px] mt-0.5">₹{product.price}</p>
        </div>
        <button
          onClick={handleBuyNow}
          className="shrink-0 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700 transition-colors"
          aria-label="Add to cart"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export function ShoppableVideoCarousel({ product }: { product: Product }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-[#F8F5F0] py-16 md:py-24 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-12 text-center">
        <h2 className="font-serif text-4xl md:text-5xl text-stone-900 font-medium">
          See the Ritual in Action
        </h2>
        <p className="font-sans text-stone-600 mt-4 text-lg">
          Experience the golden drops that transform hair.
        </p>
      </div>

      <div className="relative max-w-[1500px] mx-auto group/carousel">
        {/* Navigation Arrows */}
        <button
          onClick={scrollLeft}
          className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all z-20 shadow-lg opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={scrollRight}
          className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all z-20 shadow-lg opacity-0 group-hover/carousel:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-hide px-6 md:px-12 lg:px-24 pb-8 pt-4"
        >
          {VIDEOS.map((video) => (
            <VideoCard key={video.id} src={video.src} product={product} />
          ))}
        </div>
      </div>

      {/* Instagram Link CTA */}
      <div className="mt-4 flex justify-center">
        <a
          href="https://www.instagram.com/livaara__?igsh=MWt1YXljMTh1aDlkdg=="
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-8 py-4 bg-transparent border border-stone-900 text-stone-900 rounded-full font-sans text-sm font-medium tracking-wide hover:bg-stone-900 hover:text-white transition-all shadow-sm hover:shadow-md"
        >
          <span>Visit our Instagram for more insights</span>
        </a>
      </div>
    </section>
  );
}
