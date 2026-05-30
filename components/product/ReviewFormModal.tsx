"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";
import { toast } from "sonner";

type ReviewFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
};

export function ReviewFormModal({ isOpen, onClose, productId }: ReviewFormModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    rating?: string;
    review?: string;
  }>({});

  if (!isOpen) return null;

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; rating?: string; review?: string } = {};

    if (reviewerName.trim().length < 2) {
      newErrors.name = "Please enter your name (minimum 2 characters)";
    }
    if (rating === 0) {
      newErrors.rating = "Please select a star rating";
    }
    if (reviewText.trim().length < 20) {
      newErrors.review = "Please write at least 20 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await submitReview({
      product_id: productId,
      reviewer_name: reviewerName.trim(),
      rating,
      review_text: reviewText.trim(),
    });

    if (result.success) {
      toast.success("Thank you — your review is pending approval.");
      handleClose();
      setReviewerName("");
      setRating(0);
      setReviewText("");
    } else {
      toast.error(result.error || "Failed to submit review");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#F8F5F0] w-full max-w-lg rounded-sm shadow-none border border-stone-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="font-serif text-2xl text-stone-900 mb-2">Write a Review</h2>
          <p className="text-stone-500 text-sm mb-8">Share your ritual experience with us.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => {
                  setReviewerName(e.target.value);
                  if (e.target.value.trim().length >= 2) {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="How should we call you?"
                className="w-full bg-white border border-stone-200 rounded-sm px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#C8A96A] transition-colors"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 font-medium mb-3">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => {
                      setRating(star);
                      setErrors((prev) => ({ ...prev, rating: undefined }));
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-[#C8A96A] hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      size={24}
                      fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 font-medium mb-2">
                Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => {
                  setReviewText(e.target.value);
                  if (e.target.value.trim().length >= 20) {
                    setErrors((prev) => ({ ...prev, review: undefined }));
                  }
                }}
                maxLength={500}
                placeholder="Tell us what you loved..."
                rows={4}
                className="w-full bg-white border border-stone-200 rounded-sm px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#C8A96A] transition-colors resize-none"
              />
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {errors.review && <p className="mt-1 text-sm text-red-600">{errors.review}</p>}
                </div>
                <p
                  className={`mt-1 text-xs text-right ${reviewText.length < 20 ? "text-amber-500" : "text-stone-400"}`}
                >
                  {reviewText.length} / 500
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full bg-stone-900 text-white font-medium tracking-widest uppercase text-sm rounded-sm py-4 hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
