"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const orderNumber = searchParams.get("order_number");

  const [orderStatus, setOrderStatus] = useState<
    "loading" | "valid_success" | "pending_verification"
  >("loading");
  const [copied, setCopied] = useState(false);

  const MAX_POLLS = 10;
  const POLL_INTERVAL_MS = 3000;

  const handleCopy = () => {
    const idToCopy = orderNumber
      ? `#${String(orderNumber).padStart(3, "0")}`
      : orderId?.split("-")[0].toUpperCase() || "";
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (!orderId) {
      window.location.href = "/";
      return;
    }

    let pollTimer: ReturnType<typeof setTimeout>;

    async function checkOrder(attempt: number) {
      try {
        const res = await fetch(`/api/orders/verify?id=${orderId}`);

        if (!res.ok) {
          window.location.href = "/";
          return;
        }

        const order = (await res.json()) as {
          payment_method: string;
          payment_status: string;
        };

        if (order.payment_status === "paid") {
          setOrderStatus("valid_success");
          return;
        }

        if (order.payment_method === "cod" && order.payment_status === "pending") {
          setOrderStatus("valid_success");
          return;
        }

        if (order.payment_method === "razorpay" && order.payment_status === "pending") {
          if (attempt < MAX_POLLS) {
            setOrderStatus("pending_verification");
            pollTimer = setTimeout(() => checkOrder(attempt + 1), POLL_INTERVAL_MS);
          } else {
            // After 30 seconds still pending — show success anyway,
            // webhook will update DB asynchronously and email will arrive
            setOrderStatus("valid_success");
          }
          return;
        }

        // Fallback for any other valid state
        setOrderStatus("valid_success");
      } catch (err) {
        window.location.href = "/";
      }
    }

    checkOrder(0);

    return () => {
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [orderId]);

  if (orderStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-[#6B8E7E]/30 border-t-[#6B8E7E] rounded-full animate-spin"></div>
        <div className="text-[#6B8E7E] font-sans tracking-widest uppercase text-xs">
          Verifying Order...
        </div>
      </div>
    );
  }

  if (orderStatus === "pending_verification") {
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
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h1 className="font-serif text-3xl text-stone-900 mb-4 font-medium">Verifying Payment</h1>
        <p className="font-sans text-stone-600 mb-8 leading-relaxed">
          We're confirming your payment with Razorpay. This usually takes just a few seconds —
          please don't close this page.
        </p>
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#6B8E7E] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
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
          <div className="flex items-center justify-center gap-3">
            <p className="font-sans text-stone-900 font-medium tracking-wider">
              {orderNumber
                ? `#${String(orderNumber).padStart(3, "0")}`
                : orderId.split("-")[0].toUpperCase()}
            </p>
            <button
              onClick={handleCopy}
              className="text-stone-400 hover:text-stone-600 transition-colors flex items-center justify-center h-6"
              title="Copy Order ID"
            >
              {copied ? (
                <span className="text-[10px] uppercase tracking-widest text-[#6B8E7E]">Copied</span>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
          </div>
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
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-8 h-8 border-4 border-[#6B8E7E]/30 border-t-[#6B8E7E] rounded-full animate-spin"></div>
            <div className="text-[#6B8E7E] font-sans tracking-widest uppercase text-xs">
              Loading...
            </div>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
