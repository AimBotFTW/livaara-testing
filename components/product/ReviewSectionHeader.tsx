"use client";

import { useState } from "react";
import { ReviewFormModal } from "./ReviewFormModal";

export function ReviewSectionHeader({ productId }: { productId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <h2 className="font-serif text-3xl md:text-4xl text-stone-900 text-center md:text-left">
          Words of Devotion
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white border border-stone-300 text-stone-900 font-medium tracking-widest uppercase text-xs rounded-sm px-6 py-3 hover:bg-stone-50 transition-colors"
        >
          Write a Review
        </button>
      </div>

      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
      />
    </>
  );
}
