"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Review } from "@/lib/types/database";
import { signOutAction } from "@/app/admin/actions";
import { LogisticsInventory } from "./LogisticsInventory";
import { ReviewsModeration } from "./ReviewsModeration";
import { OrderDrawer } from "./OrderDrawer";
import { OverviewPanel } from "./OverviewPanel";
import { ManualOrderDrawer } from "./ManualOrderDrawer";
import { GlobalTelemetry } from "./GlobalTelemetry";
import { CustomerDirectory } from "./CustomerDirectory";
import type {
  AdminProductRow,
  DashboardMetrics,
  RecentOrderRow,
  CustomerDirectoryRow,
} from "@/lib/admin/queries";

type AdminView = "overview" | "analytics" | "logistics" | "customers" | "moderation" | "reports";

const NAV_ITEMS: Array<{
  id: AdminView;
  label: string;
  icon: string;
}> = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "analytics", label: "Analytics", icon: "monitoring" },
  { id: "logistics", label: "Logistics", icon: "local_shipping" },
  { id: "customers", label: "Customers", icon: "group" },
  { id: "moderation", label: "Moderation", icon: "gavel" },
  { id: "reports", label: "Reports", icon: "description" },
];

type AdminShellProps = {
  metrics: DashboardMetrics;
  orders: RecentOrderRow[];
  reviews: Review[];
  products: AdminProductRow[];
  customers: CustomerDirectoryRow[];
};

function navItemClass(active: boolean) {
  return active
    ? "flex items-center gap-md text-[#C8A96A] border-r-2 border-[#C8A96A] px-lg py-sm font-label-caps text-label-caps uppercase bg-stone-800/30 cursor-pointer transition-all duration-150 w-full text-left"
    : "flex items-center gap-md text-stone-500 px-lg py-sm font-label-caps text-label-caps uppercase hover:bg-stone-800/40 hover:text-[#C8A96A] transition-all duration-150 cursor-pointer w-full text-left";
}

function PlaceholderPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="border border-white/10 p-lg bg-black">
      <h2 className="font-section-header text-section-header text-on-surface-variant uppercase mb-md tracking-widest">
        {title}
      </h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant">{body}</p>
    </section>
  );
}

export function AdminShell({ metrics, orders, reviews, products, customers }: AdminShellProps) {
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isManualOpen, setManualOpen] = useState(false);

  const handleNavClick = (view: AdminView) => {
    setActiveView(view);
    setSelectedOrderId(null);
  };

  return (
    <div className="bg-background text-on-background font-body-sm flex h-screen overflow-hidden antialiased selection:bg-[#C8A96A]/20 selection:text-stone-200">
      <nav className="hidden md:flex h-screen w-64 flex-col border-r border-stone-800/50 bg-background py-lg shrink-0">
        <div className="px-lg mb-xl">
          <h1 className="font-headline-md text-headline-md text-stone-200 tracking-tight">
            System Admin
          </h1>
          <p className="font-body-sm text-body-sm text-stone-500 mt-sm">Livaara Operations</p>
        </div>
        <ul className="flex flex-col gap-sm flex-grow">
          {NAV_ITEMS.map((item) => {
            const active = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={navItemClass(active)}
                >
                  <span
                    className={`material-symbols-outlined ${active ? "text-[#C8A96A]" : ""}`}
                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto px-lg">
          <ul className="flex flex-col gap-sm">
            <li>
              <a
                href="mailto:your-email@example.com?subject=Livaara HQ Support Request"
                className="flex items-center gap-md text-stone-500 py-sm font-label-caps text-label-caps uppercase hover:text-[#C8A96A] transition-all duration-150 cursor-pointer w-full text-left"
              >
                <span className="material-symbols-outlined">help_outline</span>
                Support
              </a>
            </li>
            <li>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-md text-stone-500 py-sm font-label-caps text-label-caps uppercase hover:text-[#C8A96A] transition-all duration-150 cursor-pointer w-full text-left"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out
                </button>
              </form>
            </li>
          </ul>
        </div>
      </nav>
      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <header className="flex justify-between items-center px-lg h-16 border-b border-stone-800/50 bg-background w-full sticky top-0 z-50 shrink-0">
          <div className="flex items-center md:hidden">
            <span className="font-display-lg text-display-lg tracking-tighter text-stone-200">
              Livaara HQ
            </span>
          </div>
          <div className="hidden md:flex items-center">
            <span className="font-display-lg text-display-lg tracking-tighter text-stone-200">
              Livaara HQ
            </span>
          </div>
          <div className="flex items-center gap-md text-stone-200">
            <button
              type="button"
              onClick={() => {
                console.log("Button Clicked! Setting isManualOpen to true.");
                setManualOpen(true);
              }}
              className="font-button text-button uppercase tracking-widest px-md py-sm border border-[#C8A96A]/50 text-[#C8A96A] hover:bg-[#C8A96A]/10 hover:border-[#C8A96A] transition-colors cursor-pointer mr-sm"
            >
              Create Manual Order
            </button>
            <button
              type="button"
              onClick={() => toast.info("System Configurations are locked for this environment.")}
              className="hover:text-[#C8A96A] transition-colors duration-200 cursor-pointer active:opacity-70 text-stone-500"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button
              type="button"
              onClick={() => toast.success("All systems operational. No new alerts.")}
              className="hover:text-[#C8A96A] transition-colors duration-200 cursor-pointer active:opacity-70 text-stone-500"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>
        <main className="flex-grow overflow-y-auto p-md md:p-xl">
          <div className="max-w-container-max mx-auto space-y-xl" data-admin-view={activeView}>
            {activeView === "overview" && (
              <OverviewPanel metrics={metrics} orders={orders} onOrderSelect={setSelectedOrderId} />
            )}
            {activeView === "analytics" && <GlobalTelemetry metrics={metrics} />}
            {activeView === "logistics" && <LogisticsInventory products={products} />}
            {activeView === "customers" && <CustomerDirectory customers={customers} />}
            {activeView === "moderation" && <ReviewsModeration reviews={reviews} />}
            {activeView === "reports" && (
              <section className="border border-white/10 p-lg bg-black">
                <h2 className="font-section-header text-section-header text-on-surface-variant uppercase mb-md tracking-widest">
                  Data Exports
                </h2>
                <div className="flex flex-col gap-sm">
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-sm">
                    Download the most recent transactions for your accounting software.
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        const headers = [
                          "Order ID",
                          "Customer Name",
                          "Total Amount",
                          "Order Status",
                          "Date",
                        ];
                        const rows = orders.map((o) =>
                          [
                            o.displayId,
                            `"${o.customerName}"`,
                            o.totalAmount,
                            o.orderStatus,
                            new Date(o.createdAt).toLocaleDateString(),
                          ].join(","),
                        );
                        const csvContent = [headers.join(","), ...rows].join("\\n");
                        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute(
                          "download",
                          `livaara_orders_${new Date().toISOString().split("T")[0]}.csv`,
                        );
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="font-button text-button uppercase tracking-widest px-md py-sm border border-[#C8A96A]/50 text-[#C8A96A] hover:bg-[#C8A96A]/10 hover:border-[#C8A96A] transition-colors cursor-pointer inline-flex items-center gap-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Export Orders CSV
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
      {selectedOrderId && (
        <OrderDrawer orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
      {isManualOpen && (
        <ManualOrderDrawer
          isOpen={isManualOpen}
          onClose={() => setManualOpen(false)}
          products={products}
        />
      )}
    </div>
  );
}
