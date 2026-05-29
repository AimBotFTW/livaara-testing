"use client";

import Link from "next/link";
import { useSearchParams, redirect } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const orderNumber = searchParams.get("order_number");

  if (!orderId) {
    redirect("/");
  }

  return (
    <div className="max-w-md w-full bg-white border border-stone-200 p-8 md:p-12 text-center shadow-sm">
      <div className="w-16 h-16 bg-[#6B8E7E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B8E7E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <h1 className="font-serif text-4xl text-stone-900 mb-4 font-medium">Thank You</h1>
      <p className="font-sans text-stone-600 mb-8">
        Your order has been successfully placed and is now being processed. We will send you a
        confirmation email shortly.
      </p>

      {orderId && (
        <div className="bg-stone-50 border border-stone-200 py-4 mb-8">
          <p className="font-sans text-xs uppercase tracking-widest text-stone-500 mb-1">
            Order Reference
          </p>
          <p className="font-sans text-stone-900 font-medium tracking-wider">
            {orderNumber
              ? `#${String(orderNumber).padStart(3, "0")}`
              : orderId.split("-")[0].toUpperCase()}
          </p>
        </div>
      )}

      <Link
        href="/shop"
        className="block w-full bg-stone-900 text-white font-sans text-sm uppercase tracking-widest py-4 hover:bg-stone-800 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-stone-500">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
