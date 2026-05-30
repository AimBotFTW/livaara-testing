import React from "react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="bg-[#F8F5F0] min-h-screen text-stone-800 py-16 px-6 sm:px-12 md:px-24 font-body">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-sm uppercase tracking-widest text-[#C8A96A] mb-8 hover:text-stone-600 transition-colors"
        >
          ← Back to Store
        </Link>
        <h1 className="font-headline text-4xl md:text-5xl text-black mb-4">Privacy Policy</h1>
        <p className="text-sm text-stone-500 mb-12 italic">Last updated: May 2026</p>

        <div className="space-y-8 text-base leading-relaxed">
          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Introduction</h2>
            <p>
              At LIVAARA, we are committed to protecting your privacy and ensuring that your
              personal information is handled in a safe and responsible manner. This policy outlines
              how we collect, use, and safeguard your data when you visit our website or purchase
              our products.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Information we collect</h2>
            <p>
              We collect information necessary to fulfill your orders and provide the best possible
              experience. This includes your name, email address, phone number, and shipping
              address. Payment information is securely processed directly by our payment partner,
              Razorpay, and is never stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">How we use your information</h2>
            <p>
              We use the collected information strictly for order fulfillment, shipping, customer
              support, and sending transactional emails such as order receipts and shipping updates.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Data sharing</h2>
            <p>
              We do not sell your personal data. We only share necessary information with trusted
              third parties specifically for fulfilling our services to you, such as Razorpay for
              payment processing and our delivery partners for shipping your orders.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Data retention</h2>
            <p>
              To comply with legal and tax requirements, we retain your order data for a period of 3
              years. After this period, data is securely archived or deleted as per applicable laws.
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Your rights</h2>
            <p>
              You have the right to access, correct, or request the deletion of your personal data
              at any time. If you wish to exercise any of these rights, please contact us by
              emailing{" "}
              <a href="mailto:support@livaara.com" className="text-[#C8A96A] hover:underline">
                support@livaara.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-headline text-2xl text-black mb-3">Contact</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at{" "}
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
