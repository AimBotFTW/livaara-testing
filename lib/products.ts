import { createAdminClient } from "@/lib/supabase/admin";
import type { Product } from "@/lib/types/database";

/** Static fallback when Supabase is unavailable (dev / pre-migration). */
export const FALLBACK_HERO_PRODUCT: Product = {
  id: "6c14e2f3-bef1-4bf8-a7cf-11dd8dac0eec",
  name: "Lomaras™ Ayurvedic Scalp Oil",
  slug: "lomaras-ayurvedic-scalp-oil",
  description:
    "Cold-infused over seven slow days. Crafted with Bhringraj, Amla, Neem, Sesame, Brahmi & Methi in 100ml amber glass — formulated by a Vaidya who spent four decades studying scalps, not market trends.",
  price: 599,
  inventory_count: 100,
  is_active: true,
  image_url: "/images/lomaras-oil.jpg",
};

export async function getHeroProduct(): Promise<Product> {
  const supabase = createAdminClient();

  if (!supabase) {
    return FALLBACK_HERO_PRODUCT;
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, price, inventory_count, is_active, image_url")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.warn("[getHeroProduct] Using fallback product:", error?.message);
    return FALLBACK_HERO_PRODUCT;
  }

  return data as Product;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createAdminClient();

  if (!supabase) {
    return slug === FALLBACK_HERO_PRODUCT.slug ? FALLBACK_HERO_PRODUCT : null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, price, inventory_count, is_active, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    console.warn(`[getProductBySlug] Failed for slug ${slug}:`, error?.message);
    return slug === FALLBACK_HERO_PRODUCT.slug ? FALLBACK_HERO_PRODUCT : null;
  }

  return data as Product;
}

export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return [{ slug: FALLBACK_HERO_PRODUCT.slug }];
  }

  if (!supabase) {
    return [{ slug: FALLBACK_HERO_PRODUCT.slug }];
  }

  const { data, error } = await supabase.from("products").select("slug").eq("is_active", true);

  if (error || !data) {
    console.warn("[getAllProductSlugs] Failed:", error?.message);
    return [{ slug: FALLBACK_HERO_PRODUCT.slug }];
  }

  return data;
}

export async function getProductRatingStats(productId: string): Promise<{
  ratingValue: number;
  reviewCount: number;
} | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_approved", true);

  if (error || !data || data.length < 3) {
    // Return null if fewer than 3 approved reviews
    // Google requires minimum reviews before showing stars
    return null;
  }

  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;

  return {
    ratingValue: Math.round(avg * 10) / 10, // round to 1 decimal
    reviewCount: data.length,
  };
}
