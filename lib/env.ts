const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Supabase
export const NEXT_PUBLIC_SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

// Razorpay
export const RAZORPAY_KEY_ID = requireEnv("RAZORPAY_KEY_ID");
export const RAZORPAY_KEY_SECRET = requireEnv("RAZORPAY_KEY_SECRET");
export const RAZORPAY_WEBHOOK_SECRET = requireEnv("RAZORPAY_WEBHOOK_SECRET");

// Admin & Notifications
export const ADMIN_EMAIL = requireEnv("ADMIN_EMAIL");
export const RESEND_API_KEY = requireEnv("RESEND_API_KEY");
export const RESEND_FROM_EMAIL = requireEnv("RESEND_FROM_EMAIL");
