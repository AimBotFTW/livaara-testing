import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8 px-6 font-body text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="uppercase tracking-widest text-stone-400">© 2026 LIVAARA</div>
        <div className="flex gap-6">
          <Link href="/privacy" className="text-stone-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-stone-400 hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
