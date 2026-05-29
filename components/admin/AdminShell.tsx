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
  { id: "logistics", label: "Inventory", icon: "inventory_2" },
  { id: "customers", label: "Clients", icon: "group" },
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

export function AdminShell({ metrics, orders, reviews, products, customers }: AdminShellProps) {
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isManualOpen, setManualOpen] = useState(false);

  const handleNavClick = (view: AdminView) => {
    setActiveView(view);
    setSelectedOrderId(null);
  };

  const desktopNavItemClass = (active: boolean) =>
    active
      ? "flex items-center gap-4 px-4 py-3 rounded-xl text-primary font-bold shadow-[0px_0px_15px_rgba(201,163,91,0.2)] transition-all scale-[0.98] cursor-pointer"
      : "flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer";

  const mobileNavItemClass = (active: boolean) =>
    active
      ? "flex flex-col items-center justify-center text-primary drop-shadow-[0_0_8px_rgba(233,193,118,0.5)] scale-110 transition-all duration-300 ease-out cursor-pointer"
      : "flex flex-col items-center justify-center text-on-surface-variant/60 hover:text-primary/80 transition-colors cursor-pointer";

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased min-h-screen admin-mission-control">
      {/* MOBILE TOP BAR */}
      <header className="flex md:hidden bg-surface/80 backdrop-blur-md fixed top-0 w-full z-50 justify-between items-center px-6 h-16 border-b border-white/5">
        <button className="text-primary hover:opacity-80 transition-opacity scale-95 active:scale-90">
          <span className="material-symbols-outlined">search</span>
        </button>
        <h1 className="font-display-lg text-[20px] tracking-widest text-primary uppercase">
          LIVAARA HQ
        </h1>
        <button className="text-primary hover:opacity-80 transition-opacity scale-95 active:scale-90">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-white/10 flex-col py-8 z-50">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                spa
              </span>
            </div>
            <div>
              <h2 className="font-title-md text-title-md font-bold text-primary">Livaara HQ</h2>
              <p className="text-[10px] text-on-surface-variant font-label-sm uppercase tracking-widest">
                Wellness Excellence
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const active = activeView === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={desktopNavItemClass(active)}
              >
                <span
                  className="material-symbols-outlined"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-body-md">{item.label}</span>
              </div>
            );
          })}
        </nav>
        <div className="mt-auto px-4 space-y-2">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary transition-colors w-full text-left"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-body-md">Sign Out</span>
            </button>
          </form>
          <div className="mt-4 p-4 rounded-2xl bg-surface-container-highest/50 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                System Status
              </span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="text-[11px] text-primary">All nodes operational</div>
          </div>
        </div>
      </aside>

      {/* DESKTOP HEADER */}
      <header className="hidden md:flex fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-surface border-b border-white/5 z-40 items-center px-12 justify-between">
        <div className="flex items-center w-full max-w-xl">
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-md group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              className="w-full bg-surface-container-low border-none rounded-full pl-12 pr-4 py-2 text-body-md focus:ring-1 focus:ring-primary/30 placeholder:text-on-surface-variant/50 transition-all text-on-surface"
              placeholder="Search orders, clients, or products..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setManualOpen(true)}
            className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full font-label-sm text-[12px] font-bold uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-all active:scale-95 cursor-pointer"
          >
            Create Manual Order
          </button>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <button className="hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-[12px] font-bold text-on-surface group-hover:text-primary transition-colors">
                  Admin
                </p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                  Administrator
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border border-primary/30 bg-surface-container-high flex items-center justify-center text-primary overflow-hidden">
                <span className="material-symbols-outlined text-[20px]">shield_person</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main
        className="pt-24 pb-32 px-6 md:ml-64 md:mt-16 md:p-12 md:pb-12 min-h-[calc(100vh-4rem)] max-w-[1400px] animate-fade-in"
        data-admin-view={activeView}
      >
        {activeView === "overview" && (
          <OverviewPanel metrics={metrics} orders={orders} onOrderSelect={setSelectedOrderId} />
        )}
        {activeView === "analytics" && <GlobalTelemetry metrics={metrics} />}
        {activeView === "logistics" && <LogisticsInventory products={products} />}
        {activeView === "customers" && <CustomerDirectory customers={customers} />}
        {activeView === "moderation" && <ReviewsModeration reviews={reviews} />}
        {activeView === "reports" && (
          <section className="glass-card p-8 rounded-[24px]">
            <h2 className="font-title-md text-title-md text-on-surface mb-2">Data Exports</h2>
            <div className="flex flex-col gap-4 mt-4">
              <p className="text-on-surface-variant text-body-md">
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
                  className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-xl font-label-sm uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export Orders CSV
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="flex md:hidden fixed bottom-6 left-0 right-0 z-50 justify-around items-center py-3 px-6 mx-auto w-[92%] max-w-md bg-surface-container-high/80 backdrop-blur-lg rounded-full border border-white/5 shadow-[0_0_15px_rgba(201,163,91,0.1)]">
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const active = activeView === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={mobileNavItemClass(active)}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-[10px] mt-1">{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Overlays */}
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
