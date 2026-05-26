"use client";

import { useState } from "react";
import { formatAdminCurrency, formatAdminDate } from "@/lib/admin/format";
import type { CustomerDirectoryRow } from "@/lib/admin/queries";
import { CustomerDrawer } from "./CustomerDrawer";

type CustomerDirectoryProps = {
  customers: CustomerDirectoryRow[];
};

export function CustomerDirectory({ customers }: CustomerDirectoryProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDirectoryRow | null>(null);

  return (
    <section className="space-y-md">
      <div className="flex justify-between items-end border-b border-stone-800/50 pb-sm">
        <div>
          <h2 className="font-section-header text-section-header text-stone-400 uppercase tracking-widest">
            Customer Directory
          </h2>
          <p className="font-body-sm text-body-sm text-stone-500 mt-xs">
            Lifetime value and contact information.
          </p>
        </div>
      </div>

      <div className="bg-black border border-stone-800/50 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-stone-800/50 bg-stone-900/20">
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-widest font-normal">
                Customer Name
              </th>
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-widest font-normal">
                Contact
              </th>
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-widest font-normal">
                Join Date
              </th>
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-widest font-normal">
                Orders
              </th>
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-widest font-normal text-right">
                Lifetime Spend
              </th>
              <th className="p-md font-label-caps text-label-caps text-stone-500 uppercase tracking-widest font-normal text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/50">
            {customers?.length > 0 ? (
              customers.map((c) => (
                <tr key={c?.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-md align-top">
                    <p className="font-body-sm text-body-sm text-stone-200 font-medium">
                      {c?.name || "Unknown"}
                    </p>
                  </td>
                  <td className="p-md align-top">
                    {c?.email && (
                      <p className="font-body-sm text-body-sm text-stone-400">{c.email}</p>
                    )}
                    {c?.phone && (
                      <p className="font-body-sm text-body-sm text-stone-400">{c.phone}</p>
                    )}
                    {!c?.email && !c?.phone && (
                      <p className="font-body-sm text-body-sm text-stone-600">—</p>
                    )}
                  </td>
                  <td className="p-md align-top font-body-sm text-body-sm text-stone-400">
                    {c?.joinDate ? formatAdminDate(c.joinDate) : "—"}
                  </td>
                  <td className="p-md align-top font-body-sm text-body-sm text-stone-200">
                    {c?.totalOrders || 0}
                  </td>
                  <td className="p-md align-top text-right">
                    <span className="font-body-sm text-body-sm text-[#C8A96A] font-medium">
                      {c?.totalSpend ? formatAdminCurrency(c.totalSpend) : "₹0"}
                    </span>
                  </td>
                  <td className="p-md align-top text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(c)}
                      className="font-button text-button uppercase text-stone-400 hover:text-[#C8A96A] transition-colors border-b border-transparent hover:border-[#C8A96A]"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-xl text-center">
                  <p className="font-body-sm text-body-sm text-stone-500">No customers found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CustomerDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    </section>
  );
}
