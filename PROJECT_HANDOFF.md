# LIVAARA — Engineering Handoff & Production Readiness Document

**Generated:** May 26, 2026  
**Repository:** [github.com/AimBotFTW/livaara-testing](https://github.com/AimBotFTW/livaara-testing)  
**Status:** V1 Complete — Pre-Production (Test Mode)

---

## 1. PROJECT OVERVIEW

### What is Livaara?

Livaara is a direct-to-consumer (DTC) luxury Ayurvedic beauty brand. The platform sells a single hero SKU — **Lomaras™ Ayurvedic Scalp Oil (₹599)** — through a premium storefront with an integrated admin operations dashboard.

### Business Purpose

The platform exists to convert cold traffic into paying customers through a high-conversion, single-product funnel: Landing Page → Product Detail Page → Cart → Razorpay Checkout → Order Confirmation. An internal admin dashboard handles order fulfillment, inventory management, customer CRM, review moderation, and invoice generation.

### Frontend Architecture

| Layer          | Implementation                                                                                             |
| :------------- | :--------------------------------------------------------------------------------------------------------- |
| **Framework**  | Next.js 15.5.18 (App Router)                                                                               |
| **Rendering**  | Hybrid — Server Components for data fetching, Client Components for interactivity                          |
| **Styling**    | Tailwind CSS 4.2.1 with a strict design system: Warm beige `#F8F5F0`, charcoal `stone-900`, gold `#C8A96A` |
| **Typography** | Google Fonts: Cormorant Garamond (serif headings), Inter (sans body)                                       |
| **State**      | React Context (`CartContext.tsx`) for global cart state                                                    |
| **Analytics**  | Google Analytics 4 via `@next/third-parties/google` (Measurement ID: `G-NBTSBFJ2NE`)                       |

### Backend Architecture

| Layer            | Implementation                                                                 |
| :--------------- | :----------------------------------------------------------------------------- |
| **Database**     | Supabase (hosted PostgreSQL)                                                   |
| **Auth**         | Supabase Auth with JWT cookies, enforced via Next.js Middleware on `/admin/*`  |
| **Server Logic** | Next.js Server Actions (`app/actions/`) and Route Handlers (`app/api/`)        |
| **Payments**     | Razorpay (currently Test Mode)                                                 |
| **Emails**       | Resend (currently sandbox sender `onboarding@resend.dev`)                      |
| **DB Client**    | Service Role client (`lib/supabase/admin.ts`) for all mutations — bypasses RLS |

### Deployment Model

- **Hosting:** Configured for Vercel (`vercel.json` present, framework set to `nextjs`)
- **Environment:** All secrets via `.env.local`, template provided as `.env.example`
- **Branch:** `main` tracks production

### Current Maturity Level

**Late V1 / Pre-Production.** The storefront is visually complete and the core purchase flow works end-to-end in test mode. Critical production hardening (webhook system, price validation, atomic inventory) has been completed. The review system schema mismatch and RLS enforcement remain open. The system is **not safe for real money yet** — Razorpay keys are test-only and Resend emails only deliver to the account owner's address.

---

## 2. CURRENT SYSTEM STATUS

### ✅ Working Systems (Stable & Operational)

| System                       | Details                                                                                                                                                               |
| :--------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Landing Page**             | Full luxury storefront: Hero, Ingredients, Process, Ritual, Before/After, Testimonials, UGC Video Carousel, Final CTA, Footer                                         |
| **Product Detail Page**      | Hero split-screen, ingredient spotlight, ritual section, dynamic review display                                                                                       |
| **Cart Drawer**              | Slide-out drawer via `CartContext`, quantity controls, subtotal calculation                                                                                           |
| **Checkout Page**            | Full shipping form with Razorpay JS integration, form validation                                                                                                      |
| **Backend Price Validation** | `POST /api/checkout/razorpay` — validates product IDs, checks `is_active`, verifies inventory, calculates total server-side                                           |
| **Razorpay Webhook**         | `POST /api/checkout/razorpay-webhook` — HMAC signature verification, idempotent order fulfillment, atomic inventory decrement via RPC                                 |
| **Order Success Page**       | Confirmation display with order number                                                                                                                                |
| **Admin Auth**               | Supabase Auth login, middleware-protected routes, session-guarded Server Actions                                                                                      |
| **Admin Dashboard**          | Metrics overview (revenue, order count, inventory, 30-day trend)                                                                                                      |
| **Order Management**         | Orders table, detail drawer, status progression (processing → shipped → delivered), full order editing (status, payment, amounts, address, customer info, line items) |
| **Manual Order Creation**    | Admin drawer for offline/phone orders with inventory validation and RPC decrement                                                                                     |
| **Customer CRM**             | Customer directory with total orders/spend, edit drawer, delete (with order dependency check)                                                                         |
| **Inventory Management**     | Product table with inline inventory count editing                                                                                                                     |
| **Review Moderation**        | Table with approve/reject actions, status badges, verified buyer indicators                                                                                           |
| **Invoice Generation**       | Print-optimized invoice page at `/admin/invoice/[id]` with `@media print` directives                                                                                  |
| **Google Analytics**         | GA4 loaded in root layout, event helpers for `shop_now_clicked`, `checkout_started`, `payment_success`, `whatsapp_clicked`, `invoice_generated`                       |
| **Transactional Emails**     | Customer receipt and admin notification templates via Resend, triggered from webhook                                                                                  |
| **Responsive UI**            | Mobile-first layouts across storefront and admin                                                                                                                      |

### ⚠️ Partially Complete Systems

| System                   | Issue                                                                                                                                                                                                                                                                                                                                                                                       |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Review Submission**    | The `ReviewFormModal.tsx` and `submitReview` Server Action exist and compile, but the frontend `Review` type (`customer_name`, `comment`, `status`) does not match the database migration schema (`customer_id`, `review_text`, `is_approved`). Inserts will fail at runtime against the actual Supabase table.                                                                             |
| **Admin Review Actions** | `app/admin/actions.ts` exports `approveReviewAction` which sets `is_approved = true` (matching the DB schema), but `ReviewsModeration.tsx` uses `updateReviewStatus` from `app/actions/reviews.ts` which sets `status = 'approved'` (a column that does not exist in the migration). Both code paths exist simultaneously.                                                                  |
| **Email Delivery**       | Templates render correctly, but all emails send from `onboarding@resend.dev` which only delivers to the Resend account owner's email address. Customer-facing emails will silently fail.                                                                                                                                                                                                    |
| **Cart Initialization**  | `CartContext.tsx` initializes with a `DEFAULT_ITEM` containing hardcoded UUID `00000000-0000-0000-0000-000000000001`. If this UUID does not match a real product in the database, checkout will fail.                                                                                                                                                                                       |
| **Row Level Security**   | RLS is enabled on all tables in the migration, but only `products_public_read` and `reviews_public_read` policies exist. There are no insert/update/delete policies for any table. All mutations work only because they use the **service role** client which bypasses RLS entirely. If the service role key is ever compromised or if anon-key routes are added, there is zero protection. |

### 🔴 Placeholder / Test Systems

| System                           | Details                                                                                                                   |
| :------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **Razorpay Keys**                | Test mode only (`rzp_test_*`). Cannot process real transactions.                                                          |
| **UGC Videos**                   | 4 placeholder MP4 URLs from `mixkit.co` in `ShoppableVideoCarousel.tsx`. Not brand content.                               |
| **Product Images**               | No real product photography. Hero image is a placeholder/fallback.                                                        |
| **Shipping & Tax**               | Hardcoded to ₹0. Cart says "Shipping & taxes calculated at checkout" but checkout does nothing.                           |
| **`FALLBACK_HERO_PRODUCT`**      | `lib/products.ts` contains a static product object with fake UUID used when Supabase is unavailable.                      |
| **Video Carousel "Add to Cart"** | Uses hardcoded UUID `00000000-0000-0000-0000-000000000001` — will crash checkout if this product doesn't exist in the DB. |

---

## 3. DATABASE ARCHITECTURE

### Tables

```
customers ──┐
             ├── orders ──── order_items ──── products
             │
reviews ─────┘ (has customer_id FK, but frontend uses customer_name string)
```

#### `customers`

| Column       | Type          | Notes                                           |
| :----------- | :------------ | :---------------------------------------------- |
| `id`         | UUID PK       | Auto-generated                                  |
| `name`       | TEXT NOT NULL |                                                 |
| `email`      | TEXT          | Unique index on `lower(email)`, regex-validated |
| `phone`      | TEXT          | Indexed where not null                          |
| `created_at` | TIMESTAMPTZ   |                                                 |

#### `products`

| Column                     | Type          | Notes                     |
| :------------------------- | :------------ | :------------------------ |
| `id`                       | UUID PK       |                           |
| `name`                     | TEXT NOT NULL |                           |
| `description`              | TEXT          | Default `''`              |
| `price`                    | NUMERIC(10,2) | CHECK `>= 0`              |
| `inventory_count`          | INTEGER       | CHECK `>= 0`              |
| `is_active`                | BOOLEAN       | Default `true`, indexed   |
| `created_at`, `updated_at` | TIMESTAMPTZ   | `updated_at` auto-trigger |

#### `orders`

| Column                     | Type                | Notes                                                        |
| :------------------------- | :------------------ | :----------------------------------------------------------- |
| `id`                       | UUID PK             |                                                              |
| `order_number`             | INTEGER             | Sequential, added post-migration                             |
| `customer_id`              | UUID FK → customers | `ON DELETE RESTRICT`                                         |
| `shipping_address`         | JSONB               | Stores structured address object                             |
| `total_amount`             | NUMERIC(10,2)       | CHECK `>= 0`                                                 |
| `payment_method`           | ENUM                | `razorpay`, `cod`, `offline`                                 |
| `payment_status`           | ENUM                | `pending`, `paid`, `failed`, `refunded`                      |
| `order_status`             | ENUM                | `pending`, `processing`, `shipped`, `delivered`, `cancelled` |
| `razorpay_order_id`        | TEXT                | Unique index where not null                                  |
| `razorpay_payment_id`      | TEXT                |                                                              |
| `created_at`, `updated_at` | TIMESTAMPTZ         |                                                              |

**Indexes:** `customer_id`, `created_at DESC`, `payment_status`, `order_status`, unique on `razorpay_order_id`.

#### `order_items`

| Column              | Type               | Notes                          |
| :------------------ | :----------------- | :----------------------------- |
| `id`                | UUID PK            |                                |
| `order_id`          | UUID FK → orders   | `ON DELETE CASCADE`            |
| `product_id`        | UUID FK → products | `ON DELETE RESTRICT`           |
| `quantity`          | INTEGER            | CHECK `> 0`                    |
| `price_at_purchase` | NUMERIC(10,2)      | Locks in price at time of sale |

#### `reviews`

| Column                     | Type                | Notes                |
| :------------------------- | :------------------ | :------------------- |
| `id`                       | UUID PK             |                      |
| `product_id`               | UUID FK → products  | `ON DELETE CASCADE`  |
| `customer_id`              | UUID FK → customers | `ON DELETE SET NULL` |
| `rating`                   | INTEGER             | CHECK `1-5`          |
| `review_text`              | TEXT                | Default `''`         |
| `image_url`                | TEXT                | Nullable             |
| `is_verified_purchase`     | BOOLEAN             | Default `false`      |
| `is_approved`              | BOOLEAN             | Default `false`      |
| `created_at`, `updated_at` | TIMESTAMPTZ         |                      |

### Database Functions

- **`decrement_product_inventory(p_product_id UUID, p_qty INTEGER)`** — Atomic inventory subtraction with `SECURITY DEFINER`. Raises exception if insufficient stock. Used by the webhook and manual order creation.
- **`set_updated_at()`** — Trigger function auto-updating `updated_at` on products, orders, and reviews.

### Order Flow

1. Customer submits checkout → `POST /api/checkout/razorpay` validates cart, creates `pending` order + items in DB, returns Razorpay order ID
2. Razorpay JS collects payment → Razorpay sends `payment.captured` webhook
3. `POST /api/checkout/razorpay-webhook` verifies HMAC signature → updates order to `paid` / `processing` → decrements inventory via RPC → sends emails
4. Admin advances order: `processing` → `shipped` → `delivered`

### Inventory Flow

- **Online orders:** Decremented atomically via `decrement_product_inventory` RPC in the webhook handler.
- **Manual orders:** Also use the RPC function, with a JS fallback if RPC fails (in `createManualOrderAction`).
- **Admin edits:** Direct `UPDATE` to `inventory_count` via `updateInventoryAction`.
- **No reservation:** Inventory is not locked during the checkout window. Overselling is possible during simultaneous high-volume checkouts if multiple users reach the webhook at the same instant (mitigated by the RPC's `WHERE inventory_count >= p_qty` guard).

### Review Flow

> **⚠ SCHEMA MISMATCH — SEE SECTION 5**

- Frontend TypeScript type uses `customer_name`, `comment`, `status` (string enum)
- Database migration uses `customer_id` (UUID FK), `review_text`, `is_approved` (boolean)
- The `submitReview` Server Action will fail on insert against the real database

### Customer Flow

- Customers are upserted by email during checkout (`/api/checkout/razorpay`)
- The admin can create customers via manual orders
- Customers can be edited/deleted from the admin CRM (delete blocked if orders exist)

### RLS Behavior

RLS is **enabled** on all 5 tables. Only two policies exist:

| Policy                 | Table    | Effect                                     |
| :--------------------- | :------- | :----------------------------------------- |
| `products_public_read` | products | Public `SELECT` where `is_active = true`   |
| `reviews_public_read`  | reviews  | Public `SELECT` where `is_approved = true` |

All other operations (INSERT, UPDATE, DELETE on all tables) rely exclusively on the **service role key** which bypasses RLS. There are no authenticated user policies, no admin role policies, and no insert policies for the public-facing review submission flow.

---

## 4. ADMIN DASHBOARD FEATURES

### Implemented Capabilities

| Feature                    | Component                                      | Status                                                                         |
| :------------------------- | :--------------------------------------------- | :----------------------------------------------------------------------------- |
| **Auth Login**             | `AdminLoginForm.tsx`                           | ✅ Works — email/password via Supabase Auth                                    |
| **Auth Guard**             | `middleware.ts` + `lib/supabase/middleware.ts` | ✅ Redirects unauthenticated users to `/admin/login`                           |
| **Dashboard Metrics**      | `GlobalTelemetry.tsx` + `OverviewPanel.tsx`    | ✅ Revenue, order count, inventory total, 30-day revenue trend                 |
| **Orders Table**           | `RecentOrdersTable.tsx`                        | ✅ Sortable, displays `#001` format, status badges, click-to-open              |
| **Order Detail Drawer**    | `OrderDrawer.tsx`                              | ✅ Full edit: status, payment, total, address, customer info, line items       |
| **Order Status Flow**      | `updateOrderStatusAction`                      | ✅ Processing → Shipped → Delivered                                            |
| **Order Deletion**         | `deleteOrderAction`                            | ✅ Cascade deletes order items                                                 |
| **Manual Order Creation**  | `ManualOrderDrawer.tsx`                        | ✅ Offline orders with product selection, custom pricing, inventory validation |
| **Inventory Editing**      | `LogisticsInventory.tsx`                       | ✅ Inline count editing per product                                            |
| **Product Seeding**        | `seedInitialProductAction`                     | ✅ One-click seed for the hero product                                         |
| **Customer Directory**     | `CustomerDirectory.tsx`                        | ✅ List with name, email, phone, join date, total orders, total spend          |
| **Customer Detail Drawer** | `CustomerDrawer.tsx`                           | ✅ Edit name/email/phone, view order history, delete (with safeguard)          |
| **Review Moderation**      | `ReviewsModeration.tsx`                        | ⚠️ UI works but uses wrong schema fields — see Section 5                       |
| **Invoice Generation**     | `/admin/invoice/[id]`                          | ✅ Print-optimized page with `PrintInvoiceButton.tsx`                          |
| **Sign Out**               | `signOutAction`                                | ✅ Clears session, redirects to login                                          |

### Known UI Limitations

- **No search/filter on orders table.** All orders are fetched (limit 50) with no query params.
- **No CSV export.** Not implemented anywhere in the admin.
- **No pagination.** Orders, customers, and reviews all load in a single fetch.
- **Console.log statements in production:** `AdminShell.tsx` line 42 logs "Button Clicked!", `ManualOrderDrawer.tsx` line 15 logs render state.
- **No admin role verification.** `requireAdminSession()` checks only that _a_ Supabase user is logged in — it does not verify the user has admin privileges. Any authenticated Supabase user can access admin features.

### Operational Risks

- **No soft delete.** `deleteOrderAction` performs a hard SQL `DELETE`. Deleted orders are unrecoverable.
- **No audit trail.** There is no logging of who performed admin actions or when.
- **Manual order inventory fallback.** If the RPC decrement fails for a manual order, the code falls back to JS-level subtraction (lines 271-274 of `app/admin/actions.ts`), which is not atomic.

---

## 5. CRITICAL PRODUCTION BLOCKERS

### 🔴 BLOCKER 1: Review System Schema Mismatch

**The Issue:**  
The frontend TypeScript `Review` type (`lib/types/database.ts` line 46) defines: `customer_name`, `comment`, `status` (string: pending/approved/rejected), `is_verified_buyer`.

The actual PostgreSQL migration (`supabase/migrations/20250525000000_initial_schema.sql`) defines: `customer_id` (UUID FK), `review_text`, `is_approved` (boolean), `is_verified_purchase`.

These are completely different column names and types.

**Production Consequence:**

- `submitReview()` in `app/actions/reviews.ts` inserts `customer_name` and `comment` — columns that don't exist. Every customer review submission will throw a `PostgresError`.
- `getApprovedReviews()` filters by `.eq("status", "approved")` — the column `status` doesn't exist. The PDP review section will show zero reviews regardless of data.
- `ReviewsModeration.tsx` renders `r.customer_name` and `r.comment` — will display `undefined` for every row.

**Required Fix:**  
Either (a) update the Supabase migration to add the columns the frontend expects, or (b) rewrite all review Server Actions and components to use the schema's actual columns (`review_text`, `is_approved`, `product_id`, `customer_id`).

---

### 🔴 BLOCKER 2: Missing RLS Insert/Update Policies

**The Issue:**  
RLS is enabled but there are no INSERT or UPDATE policies on any table. The `submitReview` flow uses the **service role** client, so it bypasses RLS entirely. However, if any code path ever uses the anon key or a user JWT to attempt a write, it will silently fail.

**Production Consequence:**  
If a developer adds a new feature using `createClient()` (the anon/user client) instead of `createAdminClient()` (the service role client), all writes will be blocked by Postgres with no error message — just empty results.

**Required Fix:**  
Add explicit RLS policies for:

- Public INSERT on `reviews` (for customer submissions)
- Authenticated admin CRUD on all tables
- Or document clearly that **all mutations must use the service role client**

---

### 🟡 BLOCKER 3: Resend Sandbox Limitation

**The Issue:**  
All transactional emails send from `onboarding@resend.dev`. Resend restricts this sandbox sender to **only deliver emails to the email address that registered the Resend account**.

**Production Consequence:**  
Real customers will never receive their order confirmation emails. Emails will silently fail to deliver (Resend returns 200 but doesn't deliver).

**Required Fix:**

1. Verify `livaara.com` (or your sending domain) in the Resend dashboard by adding DNS records (DKIM, SPF, DMARC).
2. Update the `from` field in the webhook to `LIVAARA <noreply@livaara.com>`.

---

### 🟡 BLOCKER 4: Razorpay Test Mode

**The Issue:**  
`.env.local` contains `RAZORPAY_KEY_ID=rzp_test_StpqkAuno0aDLN`. Test keys cannot process real cards or UPI.

**Production Consequence:**  
No real transactions can be made. The Razorpay checkout modal will only accept test card numbers.

**Required Fix:**

1. Complete KYC on the Razorpay merchant dashboard.
2. Generate live keys (`rzp_live_*`).
3. Set up a webhook endpoint URL in Razorpay dashboard pointing to your production domain: `https://yourdomain.com/api/checkout/razorpay-webhook`.
4. Generate a Webhook Secret in Razorpay and add `RAZORPAY_WEBHOOK_SECRET` to production env vars.
5. Replace all test keys in production environment variables.

---

## 6. PRODUCTION HARDENING ROADMAP

### Chunk 1 — Payment Integrity ✅ COMPLETED

| Task                                           | Status  | File                                                 |
| :--------------------------------------------- | :------ | :--------------------------------------------------- |
| Razorpay webhook with HMAC verification        | ✅ Done | `app/api/checkout/razorpay-webhook/route.ts`         |
| Backend price calculation (no frontend trust)  | ✅ Done | `app/api/checkout/razorpay/route.ts`                 |
| Atomic inventory decrement via SQL RPC         | ✅ Done | Webhook uses `decrement_product_inventory`           |
| Idempotent webhook processing                  | ✅ Done | Checks `payment_status === "paid"` before processing |
| Cart validation (active, inventory, valid IDs) | ✅ Done | Route validates each product before order creation   |

### Chunk 2 — Database Consistency 🔲 NOT STARTED

| Task                                            | Priority     | Details                                                                                                                                         |
| :---------------------------------------------- | :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| Sync review schema                              | **CRITICAL** | Align `lib/types/database.ts` Review type, all Server Actions, and all components with the actual Supabase migration columns                    |
| Remove hardcoded UUIDs                          | **HIGH**     | Replace `00000000-0000-0000-0000-000000000001` in `CartContext.tsx` and `ShoppableVideoCarousel.tsx` with the real product ID from the database |
| Add `RAZORPAY_WEBHOOK_SECRET` to `.env.example` | **MEDIUM**   | Currently missing from the template                                                                                                             |
| Add `NEXT_PUBLIC_GA_ID` to `.env.example`       | **MEDIUM**   | Currently missing from the template                                                                                                             |

### Chunk 3 — Security & Cleanup 🔲 NOT STARTED

| Task                              | Priority   | Details                                                                                 |
| :-------------------------------- | :--------- | :-------------------------------------------------------------------------------------- |
| Add RLS insert policy for reviews | **HIGH**   | Allow public inserts with rate limiting                                                 |
| Add admin role check              | **HIGH**   | `requireAdminSession()` must verify a role claim, not just any authenticated user       |
| Remove dead `src/` directory      | **MEDIUM** | Legacy Vite router code, 5 files                                                        |
| Remove `api/server.js`            | **MEDIUM** | Unused Express server file                                                              |
| Remove `scripts/serve.mjs`        | **MEDIUM** | Unused serve script                                                                     |
| Remove unused shadcn components   | **MEDIUM** | 48 unused files in `components/ui/`                                                     |
| Remove 38 unused npm packages     | **MEDIUM** | See Section 7 for full list                                                             |
| Remove console.log statements     | **LOW**    | 3 instances in `AdminShell.tsx`, `ManualOrderDrawer.tsx`, `lib/analytics.ts` (dev-only) |
| Verify Resend domain              | **HIGH**   | Required before any customer email delivery works                                       |

---

## 7. DEAD CODE & TECHNICAL DEBT

### Unused Files (56 total, from `knip` static analysis)

**Legacy Vite Application (delete entire `src/` directory):**

- `src/lib/utils.ts`
- `src/router.tsx`
- `src/routes/__root.tsx`
- `src/routes/index.tsx`
- `src/routeTree.gen.ts`
- `src/styles.css`

**Unused Server Files:**

- `api/server.js` — Express server, never used in Next.js
- `scripts/serve.mjs` — Static file server, never used

**Unused Hooks:**

- `hooks/use-mobile.tsx` — Not imported anywhere

**Unused Supabase Client:**

- `lib/supabase/client.ts` — Browser client, never imported

**Unused Shadcn UI Components (48 files):**  
`accordion`, `alert-dialog`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input-otp`, `input`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toggle-group`, `toggle`, `tooltip`

### Unused npm Packages (38 dependencies)

Should be removed from `package.json` to reduce bundle size and install time:

`@hookform/resolvers`, `@radix-ui/react-accordion`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-avatar`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-context-menu`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-label`, `@radix-ui/react-menubar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-select`, `@radix-ui/react-separator`, `@radix-ui/react-slider`, `@radix-ui/react-slot`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `@radix-ui/react-tooltip`, `class-variance-authority`, `cmdk`, `date-fns`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-hook-form`, `react-resizable-panels`, `recharts`, `vaul`, `zod`

### Unused Exported Functions (7)

| Export                  | File                   | Notes                                           |
| :---------------------- | :--------------------- | :---------------------------------------------- |
| `approveReviewAction`   | `app/admin/actions.ts` | Duplicate of `updateReviewStatus`               |
| `deleteReviewAction`    | `app/admin/actions.ts` | Never called from UI                            |
| `formatOrderDisplayId`  | `lib/admin/format.ts`  | Superseded by inline `#001` formatting          |
| `truncateReview`        | `lib/admin/format.ts`  | Never imported                                  |
| `trackEvent`            | `lib/analytics.ts`     | Only used internally by other analytics helpers |
| `FALLBACK_HERO_PRODUCT` | `lib/products.ts`      | Used only within `getHeroProduct` fallback      |
| `cn`                    | `lib/utils.ts`         | Shadcn utility, not imported by any component   |

### Placeholder Assets

- **Video URLs:** 4 `mixkit.co` URLs in `ShoppableVideoCarousel.tsx`
- **Product images:** No real product photography loaded
- **Hardcoded UUIDs:** `00000000-0000-0000-0000-000000000001` appears in `CartContext.tsx` (line 26) and `ShoppableVideoCarousel.tsx` (line 42)

### Console.log Statements

| File                                     | Line | Content                                                                       |
| :--------------------------------------- | :--- | :---------------------------------------------------------------------------- |
| `components/admin/AdminShell.tsx`        | ~42  | `console.log("Button Clicked! Setting isManualOpen to true.")`                |
| `components/admin/ManualOrderDrawer.tsx` | ~15  | `console.log("ManualOrderDrawer render. isOpen:", isOpen)`                    |
| `lib/analytics.ts`                       | 5    | `console.log("GA Event:", eventName, params)` — dev-only, gated by `NODE_ENV` |

---

## 8. ENVIRONMENT VARIABLES

### Required Variables

```env
# ── Supabase ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your_service_role_key

# ── Razorpay ──────────────────────────────────────
RAZORPAY_KEY_ID=rzp_live_your_key_id
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# ── Resend ────────────────────────────────────────
RESEND_API_KEY=re_your_resend_api_key
ADMIN_EMAIL=admin@livaara.com

# ── Analytics ─────────────────────────────────────
NEXT_PUBLIC_GA_ID=G-NBTSBFJ2NE
```

### Variable Notes

| Variable                    | Scope           | Notes                                                 |
| :-------------------------- | :-------------- | :---------------------------------------------------- |
| `NEXT_PUBLIC_*`             | Client + Server | Exposed to browser bundle — never put secrets here    |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only     | **Full database access, bypasses RLS.** Never expose. |
| `RAZORPAY_KEY_SECRET`       | Server only     | Used to create orders and in the Razorpay SDK         |
| `RAZORPAY_WEBHOOK_SECRET`   | Server only     | Used for HMAC verification of incoming webhooks       |
| `RESEND_API_KEY`            | Server only     | Currently using test key `re_WsQ7AJ2L_*`              |
| `ADMIN_EMAIL`               | Server only     | Receives admin notification emails on new orders      |

---

## 9. LOCAL DEVELOPMENT & DEPLOYMENT

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/AimBotFTW/livaara-testing.git
cd livaara-testing

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Fill in all values — see Section 8

# 4. Run development server
npm run dev
# → http://localhost:3000 (storefront)
# → http://localhost:3000/admin (dashboard)

# 5. Verify production build
npm run build

# 6. Lint
npm run lint

# 7. Format
npm run format
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration file: `supabase/migrations/20250525000000_initial_schema.sql`
3. Add the `order_number` column to orders (sequential integer, auto-incrementing)
4. Create an admin user via Supabase Auth dashboard (email/password)
5. Copy `URL`, `anon key`, and `service_role key` to `.env.local`

### Razorpay Setup

1. Create a merchant account at [razorpay.com](https://razorpay.com)
2. Generate API keys (Test or Live)
3. Set up a webhook in Razorpay Dashboard:
   - URL: `https://your-domain.com/api/checkout/razorpay-webhook`
   - Events: `payment.captured`
   - Generate and save the webhook secret

### Resend Setup

1. Create an account at [resend.com](https://resend.com)
2. For production: verify your sending domain (add DNS records)
3. Generate an API key
4. Update the `from` address in `app/api/checkout/razorpay-webhook/route.ts` to use your verified domain

### Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... repeat for all variables
```

### Git Workflow

- `main` — production branch, auto-deploys to Vercel
- Feature branches should be merged via PR
- Always run `npm run build` locally before pushing — the CI will catch type errors

---

## 10. TESTING CHECKLIST

### Payment Flow

- [ ] Complete a successful test payment end-to-end (landing → cart → checkout → Razorpay → success page)
- [ ] Verify the webhook fires and order transitions from `pending` → `paid` / `processing`
- [ ] Verify inventory decrements after webhook processing
- [ ] Verify customer and admin emails are received (after domain verification)
- [ ] Test a failed payment — user should see error, no order should be created as `paid`
- [ ] Test webhook idempotency — send the same webhook payload twice, verify no duplicate order updates
- [ ] Test cart with 0 items — should be rejected at backend
- [ ] Test cart with nonexistent product ID — should return 404
- [ ] Test cart with inactive product — should return 400
- [ ] Test cart with quantity exceeding inventory — should return 400

### Mobile Checkout

- [ ] Verify checkout form is usable on iPhone SE (smallest viewport)
- [ ] Verify Razorpay modal opens correctly on mobile Safari
- [ ] Verify success page redirect works after mobile payment

### Admin Dashboard

- [ ] Login with valid credentials → dashboard loads
- [ ] Login with invalid credentials → error message
- [ ] Attempt to access `/admin` without auth → redirected to `/admin/login`
- [ ] View order detail drawer — all fields populated
- [ ] Update order status (processing → shipped → delivered)
- [ ] Edit order (change amount, address, customer info) → saves correctly
- [ ] Delete an order → confirm cascade removes order items
- [ ] Create manual order → inventory decrements, order appears in table
- [ ] Edit inventory count for a product
- [ ] Edit customer details
- [ ] Delete customer without orders → succeeds
- [ ] Delete customer with orders → blocked with error message

### Invoice Generation

- [ ] Open `/admin/invoice/[id]` for a real order
- [ ] Verify print layout (Ctrl+P) — clean A4, no nav, no background colors

### Review Moderation

- [ ] ⚠️ **BLOCKED** — Cannot test until schema mismatch is resolved
- [ ] After fix: submit review from PDP → appears as `pending` in admin
- [ ] Approve review → appears on PDP
- [ ] Reject review → hidden from PDP

### Analytics

- [ ] Verify GA4 loads (check Network tab for `gtag` requests)
- [ ] Click "Shop Now" → verify `shop_now_clicked` event fires in GA4 debug view
- [ ] Complete checkout → verify `payment_success` event with transaction ID

### RLS Validation

- [ ] Using the anon key, attempt to `SELECT` from `products` → should return only active products
- [ ] Using the anon key, attempt to `SELECT` from `orders` → should return empty (no policy)
- [ ] Using the anon key, attempt to `INSERT` into `orders` → should fail (no policy)

---

## 11. V2 ROADMAP

### Tier 1 — Revenue Optimization

| Feature                               | Impact                           | Implementation                                                                                                         |
| :------------------------------------ | :------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **Abandoned Cart Recovery**           | Recover 10-15% of lost checkouts | Supabase Edge Function cron job to detect `pending` orders older than 2 hours, trigger Resend email with discount code |
| **Customer Accounts & Order History** | Increases repeat purchase rate   | Supabase Auth for customers, `/account` route with order history, saved addresses                                      |
| **Subscription / Auto-Replenish**     | Predictable recurring revenue    | Razorpay Subscriptions API for monthly oil delivery                                                                    |

### Tier 2 — Operational Scale

| Feature                       | Impact                                      | Implementation                                                                                              |
| :---------------------------- | :------------------------------------------ | :---------------------------------------------------------------------------------------------------------- |
| **Admin Analytics Dashboard** | Real-time business intelligence without GA4 | `recharts` (already installed, unused) to visualize revenue trends, AOV, conversion rate from Supabase data |
| **Inventory Alerts**          | Prevent stockouts                           | Slack/Discord webhook when `inventory_count` drops below threshold                                          |
| **Shipping Integration**      | Automate fulfillment                        | Shiprocket or Delhivery API for label generation and tracking numbers                                       |
| **Real Tax Engine**           | Legal compliance                            | GST calculation based on product category and shipping state                                                |

### Tier 3 — Growth & Content

| Feature                          | Impact                      | Implementation                                           |
| :------------------------------- | :-------------------------- | :------------------------------------------------------- |
| **SEO Blog / Journal**           | Organic traffic acquisition | MDX-based `/journal` route with Ayurvedic content        |
| **Multi-Product Catalog**        | Revenue diversification     | Product listing page, category filters, related products |
| **Customer Reviews with Photos** | Social proof                | Already have `image_url` column in reviews schema        |
| **Referral Program**             | Viral growth                | Unique referral codes with discount attribution          |

---

## FINAL LAUNCH READINESS SUMMARY

| Category                 | Status                                                        |
| :----------------------- | :------------------------------------------------------------ |
| **Storefront UI**        | ✅ Ready                                                      |
| **Payment Security**     | ✅ Hardened (webhook + backend pricing + atomic inventory)    |
| **Razorpay Integration** | 🟡 Test mode only — needs live keys + KYC                     |
| **Email Delivery**       | 🔴 Sandbox only — needs domain verification                   |
| **Review System**        | 🔴 Schema mismatch — will crash on real database              |
| **Admin Dashboard**      | ⚠️ Functional but lacks role-based access control             |
| **RLS Security**         | ⚠️ Enabled but policies are incomplete                        |
| **Codebase Health**      | 🟡 56 dead files, 38 unused packages — functional but bloated |
| **SEO**                  | ✅ Metadata, Open Graph, semantic HTML present                |
| **Analytics**            | ✅ GA4 installed with event tracking                          |

### Verdict

**The platform is 80% ready for a soft launch.** The payment integrity is now solid. The remaining blockers are: (1) fix the review schema mismatch, (2) verify the Resend sending domain, (3) swap Razorpay to live keys, and (4) add admin role verification. These four items can be completed in a single focused engineering day. After that, the system is safe for real customers and real money.
