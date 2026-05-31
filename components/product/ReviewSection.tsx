import { createClient } from "@/lib/supabase/server";
import { Star, CheckCircle2 } from "lucide-react";
import type { Review } from "@/lib/types/database";

type ReviewSectionProps = {
  productId: string;
};

export async function ReviewSection({ productId }: ReviewSectionProps) {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
  }

  const reviewList = (reviews as Review[]) || [];

  return (
    <section className="py-12 md:py-16 border-t border-[#E8D4B0]">
      <div className="max-w-3xl">
        <div className="text-xs uppercase tracking-[0.3em] text-stone-600">Clinical Feedback</div>
        <h2 className="font-serif text-3xl md:text-4xl mt-3">Verified Reviews.</h2>
        <p className="text-stone-600 mt-4 leading-relaxed">
          Unfiltered feedback from our community. We believe in total transparency for our Ayurvedic
          formulations.
        </p>
      </div>

      <div className="mt-10">
        {reviewList.length === 0 ? (
          <div className="border border-[#E8D4B0] bg-[#F7F3EC] p-8 text-center text-stone-600">
            No reviews available for this product yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewList.map((review) => (
              <div
                key={review.id}
                className="border border-[#E8D4B0] bg-white p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-[#D4AF37] text-[#D4AF37]"
                              : "fill-stone-200 text-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed mb-6">
                    "{review.review_text}"
                  </p>
                </div>
                <div className="flex items-center border-t border-[#E8D4B0] pt-4 mt-auto">
                  <div className="text-sm font-medium text-stone-900 mr-3">
                    {review.reviewer_name || "Anonymous"}
                  </div>
                  {review.is_verified_purchase && (
                    <div className="flex items-center text-[#D4AF37] text-xs font-semibold bg-[#F7F3EC] px-2 py-1 border border-[#E8D4B0]">
                      <CheckCircle2 className="w-3 h-3 mr-1.5" />
                      Verified Buyer
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
