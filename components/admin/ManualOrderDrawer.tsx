"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createManualOrderAction } from "@/app/admin/actions";
import type { AdminProductRow } from "@/lib/admin/queries";
import { formatAdminCurrency } from "@/lib/admin/format";

type ManualOrderDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  products: AdminProductRow[];
};

const inputClass =
  "w-full bg-stone-950 border border-stone-800/50 px-md py-sm font-body-sm text-body-sm text-stone-200 focus:outline-none focus:border-[#C8A96A]/50";
const labelClass =
  "font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest block mb-xs";

export function ManualOrderDrawer({ isOpen, onClose, products }: ManualOrderDrawerProps) {
  console.log("ManualOrderDrawer render. isOpen:", isOpen);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const defaultProduct = products.find((p) => p.is_active) ?? products[0];

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentLabel, setPaymentLabel] = useState<"Cash" | "Bank Transfer">("Cash");
  const [productId, setProductId] = useState(defaultProduct?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [customProductName, setCustomProductName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [orderStatus, setOrderStatus] = useState<
    "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  >("processing");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "failed" | "refunded">(
    "paid",
  );
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen && defaultProduct && !productId) {
      setProductId(defaultProduct.id);
    }
  }, [isOpen, defaultProduct, productId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const selectedProduct = products.find((p) => p.id === productId);
  const parsedPrice =
    customItemPrice !== "" && !isNaN(Number(customItemPrice))
      ? Number(customItemPrice)
      : (selectedProduct?.price ?? 0);
  const lineTotal = parsedPrice * quantity;

  const resetForm = () => {
    setCustomerName("");
    setEmail("");
    setPhone("");
    setShippingAddress("");
    setPaymentLabel("Cash");
    setQuantity(1);
    setCustomProductName("");
    setCustomItemPrice("");
    setOrderStatus("processing");
    setPaymentStatus("paid");
    setNotes("");
    if (defaultProduct) setProductId(defaultProduct.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error("No product selected");
      return;
    }
    startTransition(async () => {
      const result = await createManualOrderAction({
        customerName,
        email,
        phone,
        shippingAddress,
        paymentLabel,
        productId,
        quantity,
        customProductName: customProductName.trim() || undefined,
        customItemPrice:
          customItemPrice !== "" && !isNaN(Number(customItemPrice))
            ? Number(customItemPrice)
            : undefined,
        notes: notes.trim() || undefined,
        orderStatus,
        paymentStatus,
      });
      if (result.ok) {
        toast.success("Manual order created");
        resetForm();
        onClose();
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to create order");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 z-[9999] w-[420px] h-screen bg-stone-950 border-l border-stone-800 flex flex-col shadow-2xl overflow-y-auto text-stone-200">
        <div className="flex justify-between items-center px-lg h-16 border-b border-stone-800 shrink-0">
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Manual Order
            </p>
            <p className="font-headline-md text-headline-md text-[#C8A96A] font-semibold tracking-tight">
              Offline / Cash Sale
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-sm text-stone-400 hover:text-[#C8A96A] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-lg space-y-lg">
          <section className="border border-stone-800 p-lg bg-black space-y-md">
            <h3 className="font-section-header text-section-header text-stone-400 uppercase tracking-widest">
              Customer
            </h3>
            <div>
              <label htmlFor="customerName" className={labelClass}>
                Name
              </label>
              <input
                id="customerName"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="address" className={labelClass}>
                Shipping Address
              </label>
              <textarea
                id="address"
                required
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
          </section>

          <section className="border border-stone-800 p-lg bg-black space-y-md">
            <h3 className="font-section-header text-section-header text-stone-400 uppercase tracking-widest">
              Order
            </h3>
            <div>
              <label htmlFor="product" className={labelClass}>
                Product
              </label>
              <select
                id="product"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className={inputClass}
              >
                {products?.length ? (
                  products.map((p) => (
                    <option key={p?.id} value={p?.id}>
                      {p?.name || "Unknown Product"} —{" "}
                      {p?.price ? formatAdminCurrency(p.price) : "₹0"}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No products available
                  </option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="customProductName" className={labelClass}>
                Custom Product Name (Optional)
              </label>
              <input
                id="customProductName"
                placeholder="e.g. Special Bulk Package"
                value={customProductName}
                onChange={(e) => setCustomProductName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="customItemPrice" className={labelClass}>
                Custom Unit Price (Optional Override)
              </label>
              <input
                id="customItemPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder={`Default: ${selectedProduct ? formatAdminCurrency(selectedProduct.price) : "₹0"}`}
                value={customItemPrice}
                onChange={(e) => setCustomItemPrice(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <div className="flex items-center gap-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 border border-stone-800 text-stone-400 hover:text-[#C8A96A] transition-colors"
                >
                  −
                </button>
                <span className="font-body-sm text-body-sm text-[#C8A96A] w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 border border-stone-800 text-stone-400 hover:text-[#C8A96A] transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="payment" className={labelClass}>
                Payment Method
              </label>
              <select
                id="payment"
                value={paymentLabel}
                onChange={(e) => setPaymentLabel(e.target.value as "Cash" | "Bank Transfer")}
                className={inputClass}
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label htmlFor="orderStatus" className={labelClass}>
                Order Status
              </label>
              <select
                id="orderStatus"
                value={orderStatus}
                onChange={(e) =>
                  setOrderStatus(
                    e.target.value as
                      | "pending"
                      | "processing"
                      | "shipped"
                      | "delivered"
                      | "cancelled",
                  )
                }
                className={inputClass}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="paymentStatus" className={labelClass}>
                Payment Status
              </label>
              <select
                id="paymentStatus"
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as "pending" | "paid" | "failed" | "refunded")
                }
                className={inputClass}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label htmlFor="notes" className={labelClass}>
                Internal Notes
              </label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
            <p className="font-headline-md text-headline-md text-[#C8A96A] font-semibold tracking-tight text-right pt-sm">
              Total: {formatAdminCurrency(lineTotal)}
            </p>
          </section>

          <button
            type="submit"
            disabled={pending || !products || products.length === 0}
            className="w-full font-button text-button uppercase px-md py-sm border border-[#C8A96A]/50 text-[#C8A96A] hover:bg-[#C8A96A]/10 hover:border-[#C8A96A] transition-colors cursor-pointer disabled:opacity-40"
          >
            {pending ? "Creating…" : "Create Paid Order"}
          </button>
        </form>
      </div>
    </>
  );
}
