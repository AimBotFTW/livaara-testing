"use client";

export function PrintInvoiceButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-white text-black text-sm uppercase tracking-widest px-6 py-2 hover:bg-stone-200 transition-colors font-medium cursor-pointer"
      type="button"
    >
      Print Invoice
    </button>
  );
}
