"use client";

import { useState } from "react";
import { Review } from "@/lib/types/database";
import { updateReviewStatus } from "@/app/actions/reviews";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function ReviewsModeration({ reviews: initialReviews }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: "pending" | "approved" | "rejected") => {
    setLoadingId(id);
    const result = await updateReviewStatus(id, status);

    if (result.success) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Review ${status}`);
    } else {
      toast.error(result.error || "Failed to update review");
    }
    setLoadingId(null);
  };

  if (reviews.length === 0) {
    return (
      <section className="border border-white/10 p-lg bg-black">
        <h2 className="font-section-header text-section-header text-on-surface-variant uppercase mb-md tracking-widest">
          Review Moderation
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          No reviews found in the system.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-white/10 bg-black">
      <div className="p-lg border-b border-white/10">
        <h2 className="font-section-header text-section-header text-on-surface-variant uppercase tracking-widest">
          Review Moderation
        </h2>
        <p className="font-body-sm text-body-sm text-stone-500 mt-2">
          Manage and curate customer testimonials.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 bg-stone-900/50">
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-wider">
                Date
              </th>
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-wider w-1/3">
                Comment
              </th>
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-wider">
                Status
              </th>
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-md font-body-sm text-stone-400 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="p-md">
                  <div className="flex flex-col">
                    <span className="font-medium text-stone-200">{r.customer_name}</span>
                    {r.is_verified_buyer && (
                      <span className="text-[10px] text-[#C8A96A] uppercase tracking-widest mt-1 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-md">
                  <div className="flex gap-0.5 text-[#C8A96A]">{r.rating} / 5</div>
                </td>
                <td className="p-md font-body-sm text-stone-400">
                  <p className="line-clamp-2" title={r.comment}>
                    {r.comment}
                  </p>
                </td>
                <td className="p-md">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs uppercase tracking-widest ${
                      r.status === "approved"
                        ? "bg-[#C8A96A]/20 text-[#C8A96A] border border-[#C8A96A]/30"
                        : r.status === "rejected"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-stone-800 text-stone-300 border border-stone-700"
                    }`}
                  >
                    {r.status === "pending" && <Clock size={12} />}
                    {r.status === "approved" && <CheckCircle2 size={12} />}
                    {r.status === "rejected" && <XCircle size={12} />}
                    {r.status}
                  </span>
                </td>
                <td className="p-md text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {r.status !== "approved" && (
                      <button
                        disabled={loadingId === r.id}
                        onClick={() => handleUpdateStatus(r.id, "approved")}
                        className="p-1.5 text-stone-400 hover:text-[#C8A96A] hover:bg-[#C8A96A]/10 border border-transparent hover:border-[#C8A96A]/30 rounded transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    {r.status !== "rejected" && (
                      <button
                        disabled={loadingId === r.id}
                        onClick={() => handleUpdateStatus(r.id, "rejected")}
                        className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
