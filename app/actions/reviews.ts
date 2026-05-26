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
 */
export async function getApprovedReviews(): Promise<Review[]> {
  const supabase = getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("[getApprovedReviews]", error?.message);
    return [];
  }

  return data as Review[];
}

/**
 * Fetches all reviews (pending, approved, rejected) for the admin moderation panel.
 */
export async function getAllReviews(): Promise<Review[]> {
  const supabase = getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("[getAllReviews]", error?.message);
    return [];
  }

  return data as Review[];
}

/**
 * Updates the status of a specific review.
 */
export async function updateReviewStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();
  if (!supabase) return { success: false, error: "Database not connected" };

  const { error } = await supabase.from("reviews").update({ status }).eq("id", id);

  if (error) {
    console.error("[updateReviewStatus]", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/product");
  return { success: true };
}

/**
 * Submits a new review from the frontend.
 */
export async function submitReview(data: {
  customer_name: string;
  rating: number;
  comment: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();
  if (!supabase) return { success: false, error: "Database not connected" };

  const { error } = await supabase.from("reviews").insert({
    customer_name: data.customer_name,
    rating: data.rating,
    comment: data.comment,
    status: "pending",
    is_verified_buyer: false,
  });

  if (error) {
    console.error("[submitReview]", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
