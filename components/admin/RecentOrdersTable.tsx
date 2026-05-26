"use client";

import { useState } from "react";
import { Inbox } from "lucide-react";
import type { RecentOrderRow } from "@/lib/admin/queries";
import {
  formatAdminCurrency,
  formatAdminDate,
  orderStatusDotClass,
  orderStatusLabel,
} from "@/lib/admin/format";

type RecentOrdersTableProps = {
  orders: RecentOrderRow[];
  onOrderSelect: (orderId: string) => void;
};

export function RecentOrdersTable({ orders, onOrderSelect }: RecentOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      !searchQuery ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.displayId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <section>
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-md gap-md">
        <h2 className="font-section-header text-section-header text-on-surface-variant uppercase tracking-widest">
          Recent Transactions
        </h2>
        <div className="flex gap-sm items-center flex-wrap">
          <input
            type="text"
            placeholder="Search by Name or Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black border border-stone-800/50 text-stone-200 px-md py-xs font-body-sm text-body-sm focus:outline-none focus:border-[#C8A96A] placeholder:text-stone-600 w-full md:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black border border-stone-800/50 text-stone-200 px-md py-xs font-body-sm text-body-sm focus:outline-none focus:border-[#C8A96A]"
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
      <div className="border border-white/10 bg-black overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                Order ID
              </th>
              <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                Customer
              </th>
              <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                Date
              </th>
              <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-right">
                Amount
              </th>
              <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-xl px-lg text-center">
                  <div className="flex flex-col items-center justify-center gap-sm">
                    <Inbox className="w-12 h-12 text-zinc-800" strokeWidth={1} />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      No orders yet
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-xl px-lg text-center">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    No orders match your search
                  </span>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => onOrderSelect(order.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOrderSelect(order.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <td className="py-md px-lg font-body-sm text-body-sm text-primary font-medium">
                    {order.displayId}
                  </td>
                  <td className="py-md px-lg font-body-sm text-body-sm text-on-surface">
                    {order.customerName}
                  </td>
                  <td className="py-md px-lg font-body-sm text-body-sm text-on-surface-variant">
                    {formatAdminDate(order.createdAt)}
                  </td>
                  <td className="py-md px-lg font-body-sm text-body-sm text-primary text-right">
                    {formatAdminCurrency(order.totalAmount)}
                  </td>
                  <td className="py-md px-lg text-center">
                    <span className="inline-flex items-center gap-sm border border-white/10 rounded-full px-sm py-xs bg-transparent">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${orderStatusDotClass(order.orderStatus)}`}
                      />
                      <span className="font-label-caps text-label-caps text-zinc-300 uppercase">
                        {orderStatusLabel(order.orderStatus)}
                      </span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
