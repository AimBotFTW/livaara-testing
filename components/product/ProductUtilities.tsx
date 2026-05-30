"use client";

import { useState } from "react";

export function ProductUtilities() {
  const [copied, setCopied] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pinStatus, setPinStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const handleShare = async () => {
    const shareData = {
      title: "Lomaras™ Ayurvedic Scalp Oil",
      text: "Crafted through generations. Discover the Livaara ritual.",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed, gracefully fallback or do nothing
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePinCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^[1-9]\d{5}$/.test(pincode)) {
      setPinStatus("valid");
    } else {
      setPinStatus("invalid");
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {/* Pincode Checker */}
      <div className="border border-[#E8D4B0] bg-white p-5">
        <div className="text-[11px] uppercase tracking-[0.28em] text-stone-500 mb-3">
          Check delivery
        </div>
        <form onSubmit={handlePinCheck} className="flex gap-2">
          <input
            type="text"
            value={pincode}
            onChange={(e) => {
              setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setPinStatus("idle");
            }}
            placeholder="Enter pincode"
            className="flex-1 bg-transparent border-b border-stone-300 px-0 py-2 text-sm font-sans text-stone-900 focus:outline-none focus:border-stone-500 transition-colors placeholder:text-stone-400"
          />
          <button
            type="submit"
            className="text-xs uppercase tracking-widest font-medium text-stone-600 hover:text-stone-900 transition-colors px-2"
          >
            Check
          </button>
        </form>
        {pinStatus === "valid" && (
          <p className="mt-3 text-xs text-[#6B8E7E] font-medium">
            Delivery available — usually ships in 2-4 days
          </p>
        )}
        {pinStatus === "invalid" && (
          <p className="mt-3 text-xs text-stone-500">Please enter a valid 6-digit pincode</p>
        )}
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 border border-[#E8D4B0] bg-transparent text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-xs uppercase tracking-widest font-sans"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        {copied ? "Link copied" : "Share Ritual"}
      </button>
    </div>
  );
}
