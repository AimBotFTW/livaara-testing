# Livaara

Livaara is a modern, full-stack e-commerce web application built with Next.js App Router, React, Tailwind CSS, and Supabase.

## Features
- **E-commerce Storefront**: Product browsing, category filtering, and product details.
- **Cart & Checkout**: Integrated cart functionality with multiple payment options (Razorpay & Cash on Delivery).
- **Authentication**: Secure user and admin authentication via Supabase.
- **Admin Dashboard**: Protected admin area for managing products, orders, and user reviews.
- **Order Management**: Email notifications via Resend for order confirmations.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Payments**: [Razorpay](https://razorpay.com/)
- **Emails**: [Resend](https://resend.com/)

## Folder Structure
- `app/`: Contains the Next.js routing structure (pages, layouts, and API routes).
  - `app/admin/`: Admin dashboard pages.
  - `app/api/`: API endpoints, including checkout and webhooks.
  - `app/checkout/`: Checkout flow.
- `components/`: Reusable UI components.
- `lib/`: Utility files (Supabase clients, formatting tools).
- `hooks/`: React hooks for shared logic.
- `supabase/`: Database schema and migration files.
- `public/`: Static images and assets.

## Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd livaara-testing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env.local` and fill in the required keys.
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables
The application relies on several environment variables for Supabase, Razorpay, Resend, and Admin configuration. Please refer to the `.env.example` file for a complete list of required keys.

## Database Setup (Supabase)
We use Supabase for PostgreSQL database, authentication, and storage.
1. Create a new Supabase project.
2. Run the SQL migrations found in the `supabase/migrations/` folder in your Supabase SQL editor to set up the `reviews`, `customers`, and other required tables.
3. Copy your project URL and Anon/Service Role keys to your `.env.local`.

## Razorpay Setup
1. Create a Razorpay account.
2. Generate API keys (Key ID and Key Secret) in the Razorpay Dashboard under Settings -> API Keys.
3. Configure a Webhook in the Razorpay Dashboard pointing to `https://your-domain.com/api/checkout/razorpay-webhook`. Add a strong Webhook Secret.
4. Add these credentials to your `.env.local`.

## Architecture Overview
- **Frontend**: Rendered using Next.js React Server Components and Client Components where interactivity is needed. UI is styled with Tailwind CSS and accessible primitives from Radix UI.
- **Backend/API**: Next.js API Routes handle sensitive operations like payment verification and order emails.
- **Database**: Supabase acts as a BaaS, securely accessed either directly from Server Components or via API routes using the Service Role key.
- **Security**: The `/admin` routes are protected by a Next.js Middleware that checks the authenticated user's email against an `ADMIN_EMAIL` allowlist.

## Deployment Guide
The app is optimized for deployment on Vercel.
1. Connect your GitHub repository to Vercel.
2. Add all environment variables from your `.env.local` into the Vercel project settings.
3. Deploy! Vercel will automatically build and host the Next.js application.

## Troubleshooting
- **Admin Access Denied**: Ensure your logged-in Supabase email matches one of the comma-separated emails in the `ADMIN_EMAIL` environment variable.
- **Payment Webhook Failing**: Check if `RAZORPAY_WEBHOOK_SECRET` in `.env.local` matches the secret configured in your Razorpay dashboard. Ensure the webhook endpoint is publicly accessible.
