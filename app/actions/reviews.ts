"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { Review } from "@/lib/types/database";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { RateLimiter } from "limiter";

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

const limiters = new Map<string, RateLimiter>();

function getLimiter(ip: string) {
  if (limiters.size > 10000) {
    limiters.clear();
  }
  if (!limiters.has(ip)) {
    limiters.set(ip, new RateLimiter({ tokensPerInterval: 3, interval: "hour" }));
  }
  return limiters.get(ip)!;
}

/**
 * Fetches only approved reviews for the frontend.
 * Joins with customers to populate customer_name for display.
 */
export async function getApprovedReviews(productId: string): Promise<Review[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      product_id,
      customer_id,
      reviewer_name,
      rating,
      review_text,
      image_url,
      is_verified_purchase,
      is_approved,
      created_at
    `,
    )
    .eq("is_approved", true)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[getApprovedReviews]", error?.message);
    return [];
  }

  return data as Review[];
}

/**
 * Fetches all reviews (approved and unapproved) for the admin moderation panel.
 * Joins with customers to populate customer_name for display.
 */
export async function getAllReviews(): Promise<Review[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      product_id,
      customer_id,
      reviewer_name,
      rating,
      review_text,
      image_url,
      is_verified_purchase,
      is_approved,
      created_at
    `,
    )
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("[getAllReviews]", error?.message);
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
  const supabase = createAdminClient();

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
  reviewer_name: string;
  rating: number;
  review_text: string;
}): Promise<{ success: boolean; error?: string }> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";

  const limiter = getLimiter(ip);
  if (!limiter.tryRemoveTokens(1)) {
    return { success: false, error: "Too many submissions. Please try again later." };
  }

  if (data.review_text.trim().length > 2000) {
    return { success: false, error: "Review must be under 2000 characters" };
  }

  if (data.reviewer_name.trim().length > 100) {
    return { success: false, error: "Name must be under 100 characters" };
  }

  const cleanName = stripHtml(data.reviewer_name);
  const cleanText = stripHtml(data.review_text);

  if (cleanText.length < 20) {
    return { success: false, error: "Review must be at least 20 characters" };
  }

  if (cleanName.length < 2) {
    return { success: false, error: "Name must be at least 2 characters" };
  }

  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
    return { success: false, error: "Please select a valid star rating" };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("reviews").insert({
    product_id: data.product_id,
    customer_id: data.customer_id ?? null,
    reviewer_name: cleanName,
    rating: data.rating,
    review_text: cleanText,
    is_approved: false,
    is_verified_purchase: false,
  });

  if (error) {
    console.error("[submitReview]", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) {
    console.error("[deleteReview]", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/product/[slug]", "page");
  return { success: true };
}
