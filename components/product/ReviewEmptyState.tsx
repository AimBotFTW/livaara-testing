"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { ReviewFormModal } from "./ReviewFormModal";

export function ReviewEmptyState({
  productName,
  productId,
}: {
  productName: string;
  productId: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="text-center py-16 bg-white border border-stone-200 rounded-sm mt-8 shadow-sm">
      <div className="w-16 h-16 bg-[#C8A96A]/10 text-[#C8A96A] rounded-full flex items-center justify-center mx-auto mb-6">
        <Star size={24} fill="currentColor" />
      </div>
      <h3 className="font-serif text-2xl text-stone-900 mb-3">
        Be the first to review {productName}
      </h3>
      <p className="text-stone-500 max-w-md mx-auto mb-8">
        Share your experience with the Livaara community and help others discover the magic of
        Ayurveda.
      </p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-stone-900 text-white font-medium tracking-widest uppercase text-xs rounded-sm px-8 py-3 hover:bg-stone-800 transition-colors"
      >
        Write a Review
      </button>

      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
      />
    </div>
  );
}
