"use client";

import { useRef, useState, useEffect } from "react";
import { useCart } from "@/lib/context/CartContext";
import { Volume2, VolumeX, Plus } from "lucide-react";
import type { Product } from "@/lib/types/database";

// Placeholder videos (aesthetic wellness/hair mp4 links)
const VIDEOS = [
  {
    id: "1",
    src: "https://assets.mixkit.co/videos/preview/mixkit-woman-rubbing-lotion-on-her-hands-4919-large.mp4",
  },
  {
    id: "2",
    src: "https://assets.mixkit.co/videos/preview/mixkit-a-woman-massaging-her-head-and-neck-4921-large.mp4",
  },
  {
    id: "3",
    src: "https://assets.mixkit.co/videos/preview/mixkit-pouring-essential-oil-into-a-small-bowl-4927-large.mp4",
  },
  {
    id: "4",
    src: "https://assets.mixkit.co/videos/preview/mixkit-woman-with-beautiful-long-hair-4929-large.mp4",
  },
];

function VideoCard({ src, product }: { src: string; product: Product }) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addToCart, toggleCart } = useCart();

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    toggleCart(true);
  };

  // Autoplay logic: observe intersection so it only plays when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.5 },
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-[280px] h-[500px] flex-shrink-0 snap-center rounded-xl overflow-hidden shadow-lg group bg-stone-900">
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        autoPlay
        loop
        muted={isMuted}
        playsInline
      />

      {/* Mute Toggle */}
      <button
        onClick={handleMuteToggle}
        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Product Card Overlap */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white rounded-lg p-3 shadow-xl flex items-center gap-3">
          <div className="w-12 h-12 bg-stone-100 rounded-md overflow-hidden relative flex-shrink-0">
            {/* Fallback box for placeholder */}
            <div className="absolute inset-0 bg-[#C8A96A]/20 flex items-center justify-center">
              <span className="text-xs text-[#C8A96A] font-serif font-bold">LIV</span>
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <h4 className="font-serif text-sm font-medium text-stone-900 truncate">
              {product.name}
            </h4>
            <p className="font-sans text-xs text-stone-500">₹{product.price}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-8 h-8 flex-shrink-0 bg-stone-900 text-white rounded-full flex items-center justify-center hover:bg-[#C8A96A] transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShoppableVideoCarousel({ product }: { product: Product }) {
  return (
    <section className="w-full bg-[#F8F5F0] py-16 md:py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-10 text-center">
        <h2 className="font-serif text-4xl md:text-5xl text-stone-900 font-medium">
          See the Ritual in Action
        </h2>
        <p className="font-sans text-stone-600 mt-4 text-lg">
          Experience the golden drops that transform hair.
        </p>
      </div>

      {/* Carousel Container */}
      <div className="w-full overflow-x-auto snap-x snap-mandatory flex gap-6 px-6 md:px-12 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Empty padding block for start alignment on scroll */}
        <div className="w-[5vw] flex-shrink-0 hidden md:block"></div>

        {VIDEOS.map((video) => (
          <VideoCard key={video.id} src={video.src} product={product} />
        ))}

        {/* Empty padding block for end alignment on scroll */}
        <div className="w-[5vw] flex-shrink-0 hidden md:block"></div>
      </div>
    </section>
  );
}
