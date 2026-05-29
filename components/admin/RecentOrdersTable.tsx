"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import type { RecentOrderRow } from "@/lib/admin/queries";
import { formatAdminCurrency, formatAdminDate, orderStatusLabel } from "@/lib/admin/format";

type RecentOrdersTableProps = {
  orders: RecentOrderRow[];
  onOrderSelect: (orderId: string) => void;
};

function StatusBadge({ status }: { status: RecentOrderRow["orderStatus"] }) {
  const s = status.toLowerCase();
  if (s === "delivered" || s === "shipped") {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0px_0px_10px_rgba(34,197,94,0.1)]">
        {orderStatusLabel(status)}
      </span>
    );
  }
  if (s === "cancelled") {
    return (
      <span className="px-3 py-1 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0px_0px_10px_rgba(239,68,68,0.1)]">
        {orderStatusLabel(status)}
      </span>
    );
  }
  // pending or processing
  return (
    <span className="px-3 py-1 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-[0px_0px_10px_rgba(201,163,91,0.1)] glow-gold">
      {orderStatusLabel(status)}
    </span>
  );
}

function getInitials(name: string) {
  if (!name || name === "Unknown") return "UK";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function RecentOrdersTable({ orders, onOrderSelect }: RecentOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !searchQuery ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.displayId?.toLowerCase().includes(searchQuery.toLowerCase());

    const sFilter = statusFilter.toLowerCase();
    const oStatus = o.orderStatus?.toLowerCase() || "";
    const matchesStatus =
      sFilter === "all" ||
      oStatus === sFilter ||
      (oStatus === "pending" && sFilter === "processing") ||
      (oStatus === "processing" && sFilter === "pending");

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* Mobile Header / Filters */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h2 className="font-title-md text-[18px] text-on-surface font-semibold">Recent Orders</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface-container border border-white/5 text-on-surface-variant rounded-lg px-2 py-1 text-[12px] focus:outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="md:hidden space-y-4 mb-8">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant text-[14px]">No orders yet</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant text-[14px]">
            No orders match your search
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onOrderSelect(order.id)}
              className="bg-surface-container p-4 rounded-[24px] border border-white/5 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                  <span className="font-bold text-[14px]">{getInitials(order.customerName)}</span>
                </div>
                <div>
                  <h4 className="font-title-md text-[14px] font-semibold text-on-surface">
                    {order.customerName}
                  </h4>
                  <p className="text-[12px] text-on-surface-variant">
                    {order.displayId} • {formatAdminDate(order.createdAt).split(",")[0]}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[12px] font-bold text-on-surface">
                  {formatAdminCurrency(order.totalAmount)}
                </span>
                <StatusBadge status={order.orderStatus} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE */}
      <section className="hidden md:block glass-card rounded-[24px] overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className="text-title-md font-title-md text-[20px] font-semibold text-on-surface mb-1">
              Recent Orders
            </h2>
            <p className="text-[12px] text-on-surface-variant">
              Manage and track your latest luxury transactions.
            </p>
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by Name or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-container border border-white/5 text-on-surface rounded-xl px-4 py-2 text-[12px] focus:outline-none focus:border-primary w-64 transition-colors"
            />
            <div className="flex rounded-lg bg-surface-container overflow-hidden border border-white/5">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 text-[12px] font-bold transition-colors ${statusFilter === "all" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("processing")}
                className={`px-4 py-2 text-[12px] font-bold transition-colors ${statusFilter === "processing" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Processing
              </button>
              <button
                onClick={() => setStatusFilter("delivered")}
                className={`px-4 py-2 text-[12px] font-bold transition-colors ${statusFilter === "delivered" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Delivered
              </button>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-white/5 text-on-surface-variant hover:text-primary transition-colors focus:outline-none focus:border-primary appearance-none text-center cursor-pointer"
            >
              <option value="all">⚲</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto premium-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-8 py-4 font-label-sm text-[12px] uppercase text-on-surface-variant tracking-widest border-b border-white/5">
                  Order ID
                </th>
                <th className="px-8 py-4 font-label-sm text-[12px] uppercase text-on-surface-variant tracking-widest border-b border-white/5">
                  Customer
                </th>
                <th className="px-8 py-4 font-label-sm text-[12px] uppercase text-on-surface-variant tracking-widest border-b border-white/5">
                  Date
                </th>
                <th className="px-8 py-4 font-label-sm text-[12px] uppercase text-on-surface-variant tracking-widest border-b border-white/5">
                  Amount
                </th>
                <th className="px-8 py-4 font-label-sm text-[12px] uppercase text-on-surface-variant tracking-widest border-b border-white/5">
                  Status
                </th>
                <th className="px-8 py-4 font-label-sm text-[12px] uppercase text-on-surface-variant tracking-widest border-b border-white/5 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Inbox className="w-12 h-12 text-on-surface-variant" strokeWidth={1} />
                      <span className="text-[14px] text-on-surface-variant">No orders yet</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-8 text-center">
                    <span className="text-[14px] text-on-surface-variant">
                      No orders match your search
                    </span>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const colors = [
                    "text-secondary border-secondary/20",
                    "text-primary border-primary/20",
                    "text-green-400 border-green-500/20",
                    "text-on-surface-variant border-white/10",
                  ];
                  const colorClass = colors[idx % colors.length];

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => onOrderSelect(order.id)}
                    >
                      <td className="px-8 py-5 font-bold text-primary text-[14px]">
                        {order.displayId}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-[12px] border ${colorClass}`}
                          >
                            {getInitials(order.customerName)}
                          </div>
                          <span className="text-on-surface font-semibold text-[14px]">
                            {order.customerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-on-surface-variant text-[14px]">
                        {formatAdminDate(order.createdAt).split(",")[0]}
                      </td>
                      <td className="px-8 py-5 text-on-surface font-bold text-[14px]">
                        {formatAdminCurrency(order.totalAmount)}
                      </td>
                      <td className="px-8 py-5">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-2">
                          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="px-8 py-6 border-t border-white/5 flex items-center justify-between">
            <p className="text-[12px] text-on-surface-variant font-label-sm">
              Showing <span className="text-on-surface">{filteredOrders.length}</span> of{" "}
              {orders.length} transactions
            </p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 rounded-lg bg-surface-container border border-white/5 text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
                disabled
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-surface-container border border-white/5 text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
