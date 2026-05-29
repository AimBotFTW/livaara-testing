# LIVAARA

LIVAARA is a premium Ayurvedic ecommerce platform built with Next.js 15, React 19, and Supabase. The platform provides a seamless shopping experience for premium scalp oil products with features like Cash on Delivery (COD) and Razorpay integration, a complete admin dashboard, and automated transactional emails.

## Features
- **Ecommerce Storefront:** Premium user interface utilizing Tailwind CSS v4 and Radix UI.
- **Payment Processing:** Integrated with Razorpay for card/UPI payments and Cash on Delivery.
- **Admin Dashboard:** Secure dashboard to manage orders, mark COD as paid, and view invoices.
- **Authentication:** Supabase Auth with secure middleware protection and allowlisted admin access.
- **Transactional Emails:** Automated customer receipts and admin notifications via Resend.
- **Database:** Supabase PostgreSQL with RPCs for secure inventory management.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **UI/Styling:** Tailwind CSS v4, Radix UI, lucide-react, sonner
- **Database/Auth:** Supabase SSR and Database
- **Payments:** Razorpay
- **Emails:** Resend & React Email

## Folder Structure
```
livaara/
├── app/               # Next.js App Router (pages, api routes, layout)
│   ├── admin/         # Admin dashboard and authentication
│   ├── api/           # API routes for checkout and webhooks
│   ├── checkout/      # Checkout page and payment processing
│   ├── ...            # Legal pages, etc.
├── components/        # Reusable React components (UI, Email Templates)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions, context, Supabase clients
├── public/            # Static assets
└── supabase/          # Database migrations and schema
```

## Local Setup Instructions
1. Clone the repository and navigate to the project directory.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in the required credentials.
4. Run the development server: `npm run dev`
5. Open `http://localhost:3000` in your browser.

## Database Setup
1. Create a Supabase project.
2. Run the SQL migrations found in the `supabase/migrations/` directory to set up tables (`orders`, `order_items`, `customers`, `reviews`) and RPC functions (like `decrement_product_inventory`).
3. Set your Supabase URL and keys in `.env.local`.

## Razorpay Setup
1. Create a Razorpay account and generate API keys.
2. Set up a webhook endpoint pointing to `/api/checkout/razorpay-webhook` for the `payment.captured` event.
3. Add your Razorpay Key ID, Secret, and Webhook Secret to `.env.local`.

## Deployment Guide
The project is optimized for deployment on Vercel.
1. Connect your GitHub repository to Vercel.
2. Ensure all environment variables from `.env.local` are added to your Vercel project settings.
3. Deploy.

## Architecture Overview
- **Authentication:** Admin routes (`/admin/*`) are protected by Next.js middleware using Supabase SSR. Access is restricted to emails listed in `ADMIN_EMAIL`.
- **Checkout Flow:** Users can choose COD or Razorpay. Client-side state is managed by `CartContext`. On successful payment, inventory is decremented via Supabase RPC, and Resend triggers email receipts.
- **Database:** Normalized relational database schema in Supabase with RLS (Row Level Security) and secure RPCs for atomic operations.

## Troubleshooting
- **Missing Emails:** Ensure `RESEND_API_KEY` is set and verify logs in your server/Vercel dashboard.
- **Authentication Issues:** Confirm your email exactly matches one of the comma-separated addresses in the `ADMIN_EMAIL` environment variable.
- **Payment Verification Failures:** Verify `RAZORPAY_WEBHOOK_SECRET` matches the webhook secret defined in the Razorpay dashboard.
