"use client";

import type { Product } from "@/lib/types/database";

// Local reels (static assets in /public/videos)
const VIDEOS = [
  {
    id: "1",
    src: "/videos/reel-1.mp4",
  },
  {
    id: "2",
    src: "/videos/reel-2.mp4",
  },
  {
    id: "3",
    src: "/videos/reel-3.mp4",
  },
  {
    id: "4",
    src: "/videos/reel-4.mp4",
  },
  {
    id: "5",
    src: "/videos/reel-5.mp4",
  },
  {
    id: "6",
    src: "/videos/reel-6.mp4",
  },
];

function VideoCard({ src, product }: { src: string; product: Product }) {
  return (
    <div className="snap-center shrink-0 w-[280px] h-[500px] border border-[#E8D4B0] overflow-hidden bg-[#0f0f0f]">
      <video src={src} autoPlay loop muted playsInline className="object-cover w-full h-full" />
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
      <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide px-6 md:px-12 pb-8">
        {VIDEOS.map((video) => (
          <VideoCard key={video.id} src={video.src} product={product} />
        ))}
      </div>

      {/* Instagram Link CTA */}
      <div className="mt-8 flex justify-center">
        <a
          href="https://www.instagram.com/livaara__?igsh=MWt1YXljMTh1aDlkdg=="
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-8 py-4 bg-transparent border border-stone-900 text-stone-900 rounded-full font-sans text-sm font-medium tracking-wide hover:bg-[#596244] hover:text-[#F8F5F0] hover:border-[#596244] transition-all shadow-sm hover:shadow-md"
        >
          <span>Visit our Instagram for more insights</span>
        </a>
      </div>
    </section>
  );
}
