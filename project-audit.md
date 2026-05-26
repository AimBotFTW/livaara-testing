# LIVAARA: Technical Audit & Project Handoff

**Date:** May 2026
**Target Audience:** Engineering Leadership, Stakeholders, Incoming Developers
**Status:** V1 Production-Ready (Test Mode)

---

## 1. The Architecture (What We Built)

The Livaara V1 architecture is a monolithic, server-rendered React application built on the edge, backed by a modern serverless ecosystem. 

### Core Technology Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Core application routing, server-side rendering, and Server Actions. |
| **Database & Auth** | Supabase | PostgreSQL relational database and secure JWT-based admin authentication. |
| **Payments** | Razorpay | Checkout gateway integration handling INR transactions and order verification. |
| **Emails** | Resend | Programmatic transactional email delivery (Receipts & Admin Notifications). |
| **Analytics** | Google Analytics 4 | `@next/third-parties/google` implementation for event tracking and telemetry. |
| **Styling** | Tailwind CSS & Vanilla CSS | Utility-first CSS using a strict Livaara design system (Beige, Charcoal, Gold). |

### Database Schema (Supabase PostgreSQL)
*   **`customers`**: Tracks uniquely identified buyers (`id`, `name`, `email`, `phone`). Upserted automatically during checkout.
*   **`products`**: Central inventory ledger (`id`, `name`, `price`, `inventory_count`, `description`).
*   **`orders`**: Financial and fulfillment record (`id`, `order_number` [sequential integer], `customer_id`, `total_amount`, `payment_status`, `order_status`, `shipping_address`, `notes`).
*   **`order_items`**: Line items resolving the many-to-many relationship between orders and products. Locks in the `price_at_purchase`.
*   **`reviews`**: Dynamic customer feedback loop (`id`, `customer_name`, `rating`, `comment`, `status` [pending/approved/rejected], `is_verified_buyer`).

---

## 2. The Green Light (What Works Perfectly)

The core conversion funnel and internal administrative tooling are fully operational and structurally sound.

### Customer Storefront
*   **Global Cart State**: React Context (`CartContext.tsx`) managing a sliding drawer, dynamic quantities, and subtotal calculations.
*   **Dynamic Review System**: Customers can submit reviews via a polished modal (`ReviewFormModal.tsx`). Reviews default to a `pending` status to prevent immediate front-end rendering, mitigating spam.
*   **Shoppable UGC Carousel**: Horizontal, swipeable video container modeled after premium DTC brands, providing a dynamic "See the Ritual in Action" experience.
*   **Responsive Livaara UI**: Pixel-perfect aesthetic scaling seamlessly from mobile to ultra-wide desktop monitors without breaking layout consistency.
*   **Razorpay Loop**: The complete checkout-to-success-page pipeline. It successfully initiates a Razorpay window, processes the test payment, creates the Supabase order, and redirects cleanly.

### Admin Dashboard ("Dark SaaS" Theme)
*   **Secure Authentication**: Next.js Middleware guarding the `/admin` routes via Supabase Auth cookies. 
*   **Sequential Order Tracking**: User-friendly `#001` integer formatting for operations, mapped securely to underlying UUIDs.
*   **Review Moderation Panel**: Real-time admin table to approve or reject customer product reviews, directly updating the Storefront PDP.
*   **Print-Ready Invoices**: A dedicated `/admin/invoice/[id]` route utilizing `@media print` directives to strip navigation and output an A4-optimized monochrome packing slip.
*   **Transactional Emails**: Resend API hooks successfully intercept the post-checkout lifecycle to distribute a Customer Receipt and an Admin Notification.

---

## 3. Technical Debt & Missing Pieces (What Doesn't Work / Is Incomplete)

> [!WARNING]
> The application is structurally complete but contains placeholder assets and bypassed logic that must be addressed prior to a live consumer launch.

### Placeholder Content (Client Action Required)
*   **Video Assets**: The UGC Carousel currently relies on generic placeholder `<video>` tags. The client must provide the final vertical 9:16 MP4 URLs (e.g., hosted on AWS S3 or an optimized CDN).
*   **Imagery**: The Product Hero and Landing Page feature placeholder image blocks/URLs. High-resolution product photography is required.
*   **Copywriting**: Some paragraphs in the "Ingredient Spotlight" and "The Ritual" sections may require final brand approval.

### Mocked Logic & Edge Cases
*   **Shipping & Taxes**: Currently hardcoded to `0`. The Cart Drawer assumes "Free Shipping" unconditionally. Future iterations need regional tax logic and shipping thresholds (e.g., Razorpay standard tax configurations).
*   **Inventory Locking**: Inventory is decremented *after* a successful payment. There is no real-time stock reservation while a user is in the checkout flow, introducing a slight risk of overselling during high-traffic drops.
*   **Email Domain Verification**: Transactional emails are routing through Resend's `onboarding@resend.dev` sandbox. The client must verify the `livaara.com` DNS records in Resend to send legitimate branded emails.

### Production Gateway Readiness
> [!IMPORTANT]
> **Razorpay is currently operating in Test Mode.** 
> To process real credit cards and UPI transactions, the client must:
> 1. Complete KYC and activate their Razorpay Merchant account.
> 2. Generate Live API Keys (`Key ID` and `Key Secret`).
> 3. Replace the test keys in the Vercel (or equivalent hosting) production environment variables.

---

## 4. Strategic Recommendations (The V2 Roadmap)

To transition Livaara from a functional storefront into a scalable, high-retention ecommerce business, the following technical initiatives are recommended for V2:

1.  **Automated Abandoned Cart Sequences**
    *   *Implementation:* Integrate a chron-job or Supabase Edge Function to parse incomplete checkouts older than 2 hours.
    *   *Impact:* Recover 10-15% of lost revenue automatically via a triggered Resend email offering a minor discount code.
2.  **Native Admin Analytics Dashboard**
    *   *Implementation:* Integrate `recharts` to pull live Supabase data and visualize Sales Velocity, Average Order Value (AOV), and Conversion Rate over time, rather than relying solely on Google Analytics external dashboards.
    *   *Impact:* Provides the operations team with immediate, actionable business intelligence without context-switching.
3.  **Customer Portal & Subscriptions**
    *   *Implementation:* Allow users to create accounts (Supabase Auth) to view their order history, track shipping status, and subscribe to automated monthly oil deliveries (Razorpay Subscriptions).
    *   *Impact:* Drastically increases Customer Lifetime Value (LTV) and creates predictable recurring revenue.
4.  **Real-Time Inventory Webhooks**
    *   *Implementation:* Implement a Slack/Discord webhook pinging the admin team whenever `inventory_count` drops below 10 units for any SKU.
    *   *Impact:* Prevents stockouts and enables proactive supply chain management.
5.  **SEO & Content Architecture (Blog)**
    *   *Implementation:* Build a statically generated `/journal` route using `Contentlayer` and MDX to publish Ayurvedic educational content.
    *   *Impact:* Drives organic, high-intent traffic from search engines, reducing Customer Acquisition Cost (CAC) over time.
