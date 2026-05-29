"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { Review } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

function getClient() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

/**
 * Fetches only approved reviews for the frontend.
 * Joins with customers to populate customer_name for display.
 */
export async function getApprovedReviews(productId: string): Promise<Review[]> {
  const supabase = getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      product_id,
      customer_id,
      rating,
      review_text,
      image_url,
      is_verified_purchase,
      is_approved,
      created_at,
      updated_at
    `,
    )
    .eq("is_approved", true)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("[getApprovedReviews]", error?.message);
    return [];
  }

  return data as Review[];
}

/**
 * Fetches all reviews (approved and unapproved) for the admin moderation panel.
 * Joins with customers to populate customer_name for display.
 */
export async function getAllReviews(): Promise<Review[]> {
  const supabase = getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      product_id,
      customer_id,
      rating,
      review_text,
      image_url,
      is_verified_purchase,
      is_approved,
      created_at,
      updated_at
    `,
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("[getAllReviews]", error?.message);
    return [];
  }

  return data as Review[];
}

/**
 * Approves or un-approves a review via is_approved boolean.
 */
export async function updateReviewStatus(
  id: string,
  approved: boolean,
): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();
  if (!supabase) return { success: false, error: "Database not connected" };

  const { error } = await supabase.from("reviews").update({ is_approved: approved }).eq("id", id);

  if (error) {
    console.error("[updateReviewStatus]", error.message);
    return { success: false, error: error.message };
  }

  // Because products are dynamic paths now:
  revalidatePath("/product/[slug]", "page");
  return { success: true };
}

/**
 * Submits a new review from the frontend.
 * Requires product_id. customer_id is optional (guest checkout supported).
 */
export async function submitReview(data: {
  product_id: string;
  customer_id?: string;
  rating: number;
  review_text: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();
  if (!supabase) return { success: false, error: "Database not connected" };

  const { error } = await supabase.from("reviews").insert({
    product_id: data.product_id,
    customer_id: data.customer_id ?? null,
    rating: data.rating,
    review_text: data.review_text,
    is_approved: false,
    is_verified_purchase: false,
  });

  if (error) {
    console.error("[submitReview]", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
