"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";
import { toast } from "sonner";

type ReviewFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ReviewFormModal({ isOpen, onClose }: ReviewFormModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!name.trim() || !comment.trim()) {
      toast.error("Please provide both name and comment");
      return;
    }

    setIsSubmitting(true);
    const result = await submitReview({
      customer_name: name.trim(),
      rating,
      comment: comment.trim(),
    });

    if (result.success) {
      toast.success("Thank you! Your review has been submitted for moderation.");
      onClose();
      // Reset form
      setRating(0);
      setName("");
      setComment("");
    } else {
      toast.error(result.error || "Failed to submit review");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#F8F5F0] w-full max-w-lg rounded-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="font-serif text-2xl text-stone-900 mb-2">Write a Review</h2>
          <p className="text-stone-500 text-sm mb-8">Share your ritual experience with us.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 font-medium mb-3">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
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
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full bg-white border border-stone-200 rounded-sm px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#C8A96A] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-500 font-medium mb-2">
                Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you loved..."
                rows={4}
                className="w-full bg-white border border-stone-200 rounded-sm px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#C8A96A] transition-colors resize-none"
                required
              />
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
