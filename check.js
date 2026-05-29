import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env.local");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function check() {
  const { data, error } = await supabase.from("reviews").select("*").limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log(
      "Reviews schema:",
      data.length > 0 ? Object.keys(data[0]) : "No data, but query succeeded!",
    );
  }
}

check();
