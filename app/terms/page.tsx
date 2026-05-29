import React from "react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="bg-[#F8F5F0] min-h-screen text-stone-800 py-16 px-6 sm:px-12 md:px-24 font-body">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm uppercase tracking-widest text-[#C8A96A] mb-8 hover:text-stone-600 transition-colors"
        >
          ← Back to Store
        </Link>
        <h1 className="font-headline text-4xl md:text-5xl text-black mb-4">Terms of Service</h1>
        <p className="text-sm text-stone-500 mb-12 italic">Last updated: May 2026</p>

        <div className="space-y-8 text-base leading-relaxed">
          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Acceptance of terms</h2>
            <p>
              By accessing and placing an order with LIVAARA, you confirm that you are in agreement
              with and bound by the terms of service contained outlined below. These terms apply to
              the entire website and any email or other type of communication between you and
              LIVAARA.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Products and pricing</h2>
            <p>
              All prices are listed in Indian Rupees (INR). We reserve the right to modify the
              prices of our products at any time without prior notice. We make every effort to
              display as accurately as possible the colors and images of our products that appear on
              the store.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Orders and payment</h2>
            <p>
              We use Razorpay as our secure payment gateway to process online payments. Cash on
              Delivery (COD) is also available for eligible orders, subject to an additional charge
              of ₹40.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Shipping</h2>
            <p>
              We offer free shipping across India. Most orders are processed and delivered within
              5-7 business days depending on your location and the courier service availability.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Returns and refunds</h2>
            <p>
              We offer a 30-day return policy for unopened and unused products in their original
              packaging. For return and refund requests, please reach out to our team at{" "}
              <a href="mailto:support@livaara.com" className="text-[#C8A96A] hover:underline">
                support@livaara.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Intellectual property</h2>
            <p>
              All content on this website, including but not limited to text, graphics, logos,
              images, and software, is the property of LIVAARA and is protected by applicable
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Governing law</h2>
            <p>
              These Terms of Service and any separate agreements whereby we provide you services
              shall be governed by and construed in accordance with the laws of India, with
              exclusive jurisdiction in Nashik, Maharashtra.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Contact</h2>
            <p>
              Questions about the Terms of Service should be sent to us at{" "}
              <a href="mailto:support@livaara.com" className="text-[#C8A96A] hover:underline">
                support@livaara.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
