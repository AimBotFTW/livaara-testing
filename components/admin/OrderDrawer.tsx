"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  fetchOrderDetailAction,
  updateOrderStatusAction,
  deleteOrderAction,
  updateOrderAction,
} from "@/app/admin/actions";
import type { OrderDetail } from "@/lib/admin/queries";
import {
  formatAdminCurrency,
  formatAdminDate,
  nextOrderStatus,
  orderStatusDotClass,
  orderStatusLabel,
} from "@/lib/admin/format";
import type { OrderStatus, PaymentStatus } from "@/lib/types/database";
import { trackInvoiceGenerated } from "@/lib/analytics";

type OrderDrawerProps = {
  orderId: string | null;
  onClose: () => void;
};

const inputClass =
  "w-full bg-stone-950 border border-stone-800/50 px-md py-sm font-body-sm text-body-sm text-stone-200 focus:outline-none focus:border-[#C8A96A]/50 mt-xs";
const labelClass =
  "font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest block";

type EditFormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerPrakriti: string[];
  shippingAddress: string;
  notes: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  codCharge: string;
  totalAmount: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    priceAtPurchase: string;
  }>;
};

export function OrderDrawer({ orderId, onClose }: OrderDrawerProps) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);

  useEffect(() => {
    if (!orderId) {
      setDetail(null);
      setIsEditing(false);
      setConfirmDelete(false);
      return;
    }
    setLoading(true);
    fetchOrderDetailAction(orderId).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [orderId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (orderId) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [orderId, onClose]);

  const open = Boolean(orderId);
  const nextStatus = detail ? nextOrderStatus(detail.orderStatus) : null;

  const startEdit = () => {
    if (!detail) return;
    setIsEditing(true);
    setEditForm({
      customerName: detail.customer.name,
      customerEmail: detail.customer.email || "",
      customerPhone: detail.customer.phone || "",
      customerPrakriti: detail.customer.prakriti || [],
      shippingAddress: formatShippingAddress(detail.shippingAddress).join(", "),
      notes: (detail.shippingAddress as Record<string, string>)?.notes || "",
      orderStatus: detail.orderStatus,
      paymentStatus: detail.paymentStatus as PaymentStatus,
      paymentMethod: detail.paymentMethod,
      codCharge: detail.codCharge.toString(),
      totalAmount: detail.totalAmount.toString(),
      items: detail.items.map((i) => ({
        id: i.id,
        productName: i.productName,
        quantity: i.quantity,
        priceAtPurchase: i.priceAtPurchase.toString(),
      })),
    });
  };

  const handleSaveEdit = () => {
    if (!detail || !editForm) return;
    startTransition(async () => {
      const result = await updateOrderAction({
        orderId: detail.id,
        orderStatus: editForm.orderStatus,
        paymentStatus: editForm.paymentStatus,
        totalAmount: Number(editForm.totalAmount),
        codCharge: Number(editForm.codCharge),
        shippingAddress: editForm.shippingAddress,
        notes: editForm.notes,
        customerName: editForm.customerName,
        customerEmail: editForm.customerEmail,
        customerPhone: editForm.customerPhone,
        customerPrakriti: editForm.customerPrakriti,
        items: editForm.items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          priceAtPurchase: Number(i.priceAtPurchase),
        })),
      });
      if (result.ok) {
        toast.success("Order updated successfully");
        setIsEditing(false);
        const refreshed = await fetchOrderDetailAction(detail.id);
        setDetail(refreshed);
      } else {
        toast.error(result.error ?? "Failed to update order");
      }
    });
  };

  const handleStatusAdvance = () => {
    if (!detail || !nextStatus) return;
    startTransition(async () => {
      const result = await updateOrderStatusAction(detail.id, nextStatus);
      if (result.ok) {
        setDetail({ ...detail, orderStatus: nextStatus });
        toast.success(`Status updated to ${orderStatusLabel(nextStatus)}`);
      } else {
        toast.error(result.error ?? "Update failed");
      }
    });
  };

  const setStatus = (status: OrderStatus) => {
    if (!detail) return;
    startTransition(async () => {
      const result = await updateOrderStatusAction(detail.id, status);
      if (result.ok) {
        setDetail({ ...detail, orderStatus: status });
        toast.success(`Status updated to ${orderStatusLabel(status)}`);
      } else {
        toast.error(result.error ?? "Update failed");
      }
    });
  };

  const handleDelete = () => {
    if (!detail) return;
    startTransition(async () => {
      const result = await deleteOrderAction(detail.id);
      if (result.ok) {
        toast.success("Order deleted");
        onClose();
      } else {
        toast.error(result.error ?? "Failed to delete order");
      }
    });
  };

  const addressLines = detail ? formatShippingAddress(detail.shippingAddress) : [];

  if (!orderId) return null;

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
              Order Detail {isEditing && "- EDIT MODE"}
            </p>
            <p className="font-headline-md text-headline-md text-[#C8A96A] font-semibold tracking-tight">
              {detail?.displayId ?? "—"}
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

        <div className="flex-grow overflow-y-auto p-lg space-y-lg">
          {loading && <p className="font-body-sm text-body-sm text-stone-400">Loading…</p>}
          {!loading && !detail && open && (
            <p className="font-body-sm text-body-sm text-stone-400">Order not found.</p>
          )}
          {detail && !isEditing && (
            <>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={startEdit}
                  className="font-button text-button uppercase px-md py-sm border border-[#C8A96A]/50 text-[#C8A96A] hover:bg-[#C8A96A]/10 transition-colors cursor-pointer"
                >
                  Edit Order
                </button>
              </div>
              <section className="border border-stone-800 p-lg bg-black">
                <h3 className="font-section-header text-section-header text-stone-400 uppercase mb-md tracking-widest">
                  Customer Info
                </h3>
                <p className="font-body-sm text-body-sm text-[#C8A96A] font-medium">
                  {detail?.customer?.name || "Unknown Customer"}
                </p>
                {detail?.customer?.email && (
                  <p className="font-body-sm text-body-sm text-stone-400 mt-xs">
                    {detail.customer.email}
                  </p>
                )}
                {detail?.customer?.phone && (
                  <p className="font-body-sm text-body-sm text-stone-400 mt-xs">
                    {detail.customer.phone}
                  </p>
                )}
                <p className="font-body-sm text-body-sm text-stone-400 mt-sm">
                  {detail?.createdAt ? formatAdminDate(detail.createdAt) : "Unknown Date"}
                </p>
              </section>

              <section className="border border-stone-800 p-lg bg-black">
                <h3 className="font-section-header text-section-header text-stone-400 uppercase mb-md tracking-widest">
                  Items Ordered
                </h3>
                <ul className="divide-y divide-stone-800/50">
                  {detail?.items?.length ? (
                    detail.items.map((item) => (
                      <li key={item?.id} className="py-sm flex justify-between gap-md">
                        <span className="font-body-sm text-body-sm text-stone-200">
                          {item?.productName || "Unknown Item"} × {item?.quantity || 0}
                        </span>
                        <span className="font-body-sm text-body-sm text-[#C8A96A]">
                          {item?.priceAtPurchase && item?.quantity
                            ? formatAdminCurrency(item.priceAtPurchase * item.quantity)
                            : "₹0"}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="font-body-sm text-body-sm text-stone-400">No line items</li>
                  )}
                </ul>
                <p className="font-headline-md text-headline-md text-[#C8A96A] font-semibold tracking-tight mt-md text-right">
                  {detail?.totalAmount ? formatAdminCurrency(detail.totalAmount) : "₹0"}
                </p>
              </section>

              <section className="border border-stone-800 p-lg bg-black">
                <h3 className="font-section-header text-section-header text-stone-400 uppercase mb-md tracking-widest">
                  Razorpay Transaction
                </h3>
                <p className="font-label-caps text-label-caps text-stone-400 uppercase">Order ID</p>
                <p className="font-body-sm text-body-sm text-[#C8A96A] mt-xs break-all">
                  {detail?.razorpayOrderId ?? "—"}
                </p>
                <p className="font-label-caps text-label-caps text-stone-400 uppercase mt-md">
                  Payment ID
                </p>
                <p className="font-body-sm text-body-sm text-[#C8A96A] mt-xs break-all">
                  {detail?.razorpayPaymentId ?? "—"}
                </p>
                <p className="font-label-caps text-label-caps text-stone-400 uppercase mt-md">
                  Payment Status
                </p>
                <p className="font-body-sm text-body-sm text-stone-200 mt-xs capitalize">
                  {detail?.paymentStatus || "Unknown"}
                </p>
              </section>

              <section className="border border-stone-800 p-lg bg-black">
                <h3 className="font-section-header text-section-header text-stone-400 uppercase mb-md tracking-widest">
                  Shipping Address
                </h3>
                {addressLines?.length > 0 ? (
                  addressLines.map((line, i) => (
                    <p key={i} className="font-body-sm text-body-sm text-stone-400">
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="font-body-sm text-body-sm text-stone-400">No address on file</p>
                )}

                {(detail?.shippingAddress as Record<string, string>)?.notes && (
                  <div className="mt-md pt-md border-t border-stone-800/50">
                    <p className="font-label-caps text-label-caps text-stone-400 uppercase">
                      Internal Notes
                    </p>
                    <p className="font-body-sm text-body-sm text-stone-400 mt-xs">
                      {(detail.shippingAddress as Record<string, string>).notes}
                    </p>
                  </div>
                )}
              </section>

              <section className="border border-stone-800 p-lg bg-black">
                <h3 className="font-section-header text-section-header text-stone-400 uppercase mb-md tracking-widest">
                  Status
                </h3>
                <div className="flex items-center gap-sm mb-md">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${detail?.orderStatus ? orderStatusDotClass(detail.orderStatus) : "bg-stone-500"}`}
                  />
                  <span className="font-label-caps text-label-caps text-stone-200 uppercase">
                    {detail?.orderStatus ? orderStatusLabel(detail.orderStatus) : "Unknown"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-sm">
                  {(["processing", "shipped", "delivered"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={pending || detail?.orderStatus === s}
                      onClick={() => setStatus(s)}
                      className={`font-button text-button uppercase px-md py-sm border transition-colors cursor-pointer ${
                        detail?.orderStatus === s
                          ? "border-[#C8A96A] text-[#C8A96A] bg-[#C8A96A]/10"
                          : "border-stone-800 text-stone-400 hover:text-[#C8A96A] hover:border-[#C8A96A]/50"
                      } disabled:opacity-40`}
                    >
                      {orderStatusLabel(s)}
                    </button>
                  ))}
                </div>
                {nextStatus && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={handleStatusAdvance}
                    className="mt-md w-full font-button text-button uppercase px-md py-sm border border-[#C8A96A]/50 text-[#C8A96A] hover:bg-[#C8A96A]/10 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Advance to {orderStatusLabel(nextStatus)} →
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    trackInvoiceGenerated(detail.id);
                    window.open(`/admin/invoice/${detail.id}`, "_blank");
                  }}
                  className="mt-lg w-full font-button text-button uppercase px-md py-sm border border-stone-800 text-stone-200 hover:text-[#C8A96A] hover:border-[#C8A96A]/50 transition-colors cursor-pointer"
                >
                  Generate Invoice
                </button>

                {!confirmDelete ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setConfirmDelete(true)}
                    className="mt-lg w-full font-button text-button uppercase px-md py-sm border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Delete Order
                  </button>
                ) : (
                  <div className="mt-lg flex items-center justify-between gap-sm">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={pending}
                      className="flex-1 font-button text-button uppercase px-sm py-sm border border-red-500 bg-red-500 text-black hover:bg-red-500/90 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {pending ? "..." : "Yes, delete"}
                    </button>
                    <span className="text-[10px] text-red-400 text-center leading-tight flex-[0.8]">
                      This action cannot be undone.
                    </span>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      disabled={pending}
                      className="flex-1 font-button text-button uppercase px-sm py-sm border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </section>
            </>
          )}

          {detail && isEditing && editForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="space-y-md"
            >
              <section className="border border-stone-800 p-lg bg-black space-y-md">
                <h3 className="font-section-header text-section-header text-stone-400 uppercase tracking-widest">
                  Customer Info
                </h3>
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    value={editForm.customerName}
                    onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    value={editForm.customerEmail}
                    onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    value={editForm.customerPhone}
                    onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Prakriti (dosha type)</label>
                  <div className="flex gap-2 mt-xs">
                    {["Vata", "Pitta", "Kapha"].map((dosha) => {
                      const isSelected = editForm.customerPrakriti.includes(dosha);
                      return (
                        <button
                          key={dosha}
                          type="button"
                          onClick={() => {
                            const newPrakriti = isSelected
                              ? editForm.customerPrakriti.filter((d) => d !== dosha)
                              : [...editForm.customerPrakriti, dosha];
                            setEditForm({ ...editForm, customerPrakriti: newPrakriti });
                          }}
                          className={`flex-1 py-sm font-body-sm text-body-sm transition-colors border ${
                            isSelected
                              ? "border-[#C8A96A] text-[#C8A96A] bg-[#C8A96A]/10"
                              : "border-stone-800/50 bg-stone-950 text-stone-200 hover:border-stone-700"
                          }`}
                        >
                          {dosha}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="border border-stone-800 p-lg bg-black space-y-md">
                <h3 className="font-section-header text-section-header text-stone-400 uppercase tracking-widest">
                  Shipping & Notes
                </h3>
                <div>
                  <label className={labelClass}>Address</label>
                  <textarea
                    value={editForm.shippingAddress}
                    onChange={(e) => setEditForm({ ...editForm, shippingAddress: e.target.value })}
                    className={`${inputClass} resize-none`}
                    rows={3}
                  />
                </div>
                <div>
                  <label className={labelClass}>Internal Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className={`${inputClass} resize-none`}
                    rows={2}
                  />
                </div>
              </section>

              <section className="border border-stone-800 p-lg bg-black space-y-md">
                <h3 className="font-section-header text-section-header text-stone-400 uppercase tracking-widest">
                  Order Status
                </h3>
                <div>
                  <label className={labelClass}>Fulfillment Status</label>
                  <select
                    value={editForm.orderStatus}
                    onChange={(e) =>
                      setEditForm({ ...editForm, orderStatus: e.target.value as OrderStatus })
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
                  <label className={labelClass}>Payment Status</label>
                  <select
                    value={editForm.paymentStatus}
                    onChange={(e) =>
                      setEditForm({ ...editForm, paymentStatus: e.target.value as PaymentStatus })
                    }
                    className={inputClass}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </section>

              <section className="border border-stone-800 p-lg bg-black space-y-md">
                <h3 className="font-section-header text-section-header text-stone-400 uppercase tracking-widest">
                  Line Items
                </h3>
                {editForm.items.map((item, idx) => (
                  <div key={item.id} className="p-md border border-stone-800/50 space-y-md">
                    <p className="font-body-sm text-body-sm text-[#C8A96A] font-medium">
                      {item.productName}
                    </p>
                    <div className="flex gap-md">
                      <div className="flex-1">
                        <label className={labelClass}>Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.priceAtPurchase}
                          onChange={(e) => {
                            const newItems = [...editForm.items];
                            newItems[idx].priceAtPurchase = e.target.value;
                            setEditForm({ ...editForm, items: newItems });
                          }}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex-1">
                        <label className={labelClass}>Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...editForm.items];
                            newItems[idx].quantity = Number(e.target.value);
                            setEditForm({ ...editForm, items: newItems });
                          }}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {editForm.paymentMethod === "cod" && (
                  <div>
                    <label className={labelClass}>COD charge</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.codCharge}
                      onChange={(e) => setEditForm({ ...editForm, codCharge: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                )}

                <div>
                  <label className={labelClass}>Grand Total Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.totalAmount}
                    onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                    className={inputClass}
                  />
                  <p className="text-xs text-stone-500 mt-xs">
                    Override the total sum. Does not auto-calculate.{" "}
                    {editForm.paymentMethod === "cod"
                      ? "Remember to include COD charge in the total if applicable."
                      : ""}
                  </p>
                </div>
              </section>

              <div className="flex gap-md pt-md">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 font-button text-button uppercase px-md py-sm border border-[#C8A96A] bg-[#C8A96A] text-black hover:bg-[#C8A96A]/90 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {pending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={pending}
                  className="flex-1 font-button text-button uppercase px-md py-sm border border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function formatShippingAddress(addr: Record<string, unknown>): string[] {
  const lines: string[] = [];
  const keys = ["line1", "line2", "street", "city", "state", "pincode", "postal_code", "country"];
  for (const k of keys) {
    const v = addr[k];
    if (typeof v === "string" && v.trim()) lines.push(v);
  }
  if (lines.length === 0 && typeof addr.formatted === "string") {
    return [addr.formatted];
  }
  return lines;
}
