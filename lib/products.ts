import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types/database";

/** Static fallback when Supabase is unavailable (dev / pre-migration). */
export const FALLBACK_HERO_PRODUCT: Product = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Lomaras™ Ayurvedic Scalp Oil",
  description:
    "Cold-infused over seven slow days. Crafted with Bhringraj, Amla, Neem, Sesame, Brahmi & Methi in 100ml amber glass — formulated by a Vaidya who spent four decades studying scalps, not market trends.",
  price: 599,
  inventory_count: 100,
  is_active: true,
};

export async function getHeroProduct(): Promise<Product> {
  const supabase = await createClient();

  if (!supabase) {
    return FALLBACK_HERO_PRODUCT;
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, inventory_count, is_active")
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
