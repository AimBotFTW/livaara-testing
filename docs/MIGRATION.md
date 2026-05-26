# Livaara — Next.js + Supabase migration

## Step 1 complete: Next.js App Router

- **Entry**: `app/page.tsx` composes `components/landing/*` (pixel-frozen markup).
- **Styles**: `app/globals.css` (copied from `src/styles.css`; `@source` paths updated for `app/` + `components/`).
- **Assets**: `public/images/*.jpg` via `next/image` (`LandingImage` wrapper).
- **Legacy TanStack**: `src/`, `vite.config.ts`, `api/server.js` are obsolete — safe to remove after verification.

### Run locally

```bash
npm install
cp .env.example .env.local   # add Supabase keys when ready
npm run dev
```

## Step 2 complete: Supabase schema

### Apply migration

**Option A — Supabase Dashboard**

1. Open SQL Editor in your project.
2. Run `supabase/migrations/20250525000000_initial_schema.sql`.
3. Run `supabase/seed.sql`.

**Option B — Supabase CLI**

```bash
supabase link --project-ref <your-ref>
supabase db push
psql $DATABASE_URL -f supabase/seed.sql
```

### Tables

| Table         | Purpose                                      |
| ------------- | -------------------------------------------- |
| `customers`   | Buyer identity (name, email, phone)          |
| `products`    | Catalog; hero SKU seeded at ₹599             |
| `orders`      | Order header + Razorpay IDs + status enums   |
| `order_items` | Line items with `price_at_purchase` snapshot |
| `reviews`     | Moderated testimonials (`is_approved`)       |

### Env vars

See `.env.example`. Without Supabase env, the site uses `FALLBACK_HERO_PRODUCT` (₹599) so the UI still builds.

### Product wiring

`lib/products.ts` → `getHeroProduct()` fetches the first active product; used by `Product`, `Header`, and `FinalCTA`.

## Admin authentication

1. In Supabase Dashboard → **Authentication** → **Users**, create a user (email + password).
2. Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. Visit `/admin` — you will be redirected to `/admin/login` until signed in.
4. **Sign Out** in the sidebar calls `signOutAction` and returns you to `/admin/login`.

Middleware (`middleware.ts`) protects all `/admin/*` routes except `/admin/login`.

## Admin features

- **Logistics** — inventory table with +/- and Save (updates `products.inventory_count`).
- **Overview** — **Create Manual Order** opens a slide-over; creates paid offline orders and decrements stock.

## Next: Steps 3–5 (awaiting your review)

- Razorpay checkout + webhook
- `/admin` Mission Control
- Dynamic reviews, GA/Clarity, WhatsApp float
