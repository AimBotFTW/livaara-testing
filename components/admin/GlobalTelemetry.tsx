import type { DashboardMetrics } from "@/lib/admin/queries";
import { formatAdminCurrency } from "@/lib/admin/format";

type GlobalTelemetryProps = {
  metrics: DashboardMetrics;
};

export function GlobalTelemetry({ metrics }: GlobalTelemetryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 md:mb-12">
      {/* Revenue */}
      <div className="glass-card p-6 md:p-8 rounded-[24px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all"></div>
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              payments
            </span>
          </div>
          {metrics.revenueChangePercent !== null && (
            <span
              className={`flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-lg ${metrics.revenueChangePercent >= 0 ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}
            >
              <span className="material-symbols-outlined text-[14px]">
                {metrics.revenueChangePercent >= 0 ? "trending_up" : "trending_down"}
              </span>
              {metrics.revenueChangePercent >= 0 ? "+" : ""}
              {metrics.revenueChangePercent}%
            </span>
          )}
        </div>
        <h3 className="text-on-surface-variant text-[12px] font-bold uppercase tracking-widest mb-1">
          Total Revenue
        </h3>
        <p className="text-[24px] md:text-[32px] font-display-lg font-bold text-on-surface tracking-tight leading-none">
          {formatAdminCurrency(metrics.totalRevenue)}
        </p>
        {metrics.pendingCodRevenue > 0 && (
          <p className="text-[12px] text-[#C8A96A] mt-2">
            + {formatAdminCurrency(metrics.pendingCodRevenue)} COD pending
          </p>
        )}
      </div>

      {/* Orders */}
      <div className="glass-card p-6 md:p-8 rounded-[24px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-secondary/10 transition-all"></div>
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shopping_bag
            </span>
          </div>
        </div>
        <h3 className="text-on-surface-variant text-[12px] font-bold uppercase tracking-widest mb-1">
          Total Orders
        </h3>
        <p className="text-[24px] md:text-[32px] font-display-lg font-bold text-on-surface tracking-tight leading-none">
          {metrics.totalOrders.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Inventory */}
      <div className="glass-card p-6 md:p-8 rounded-[24px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-on-surface-variant/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-on-surface-variant/10 transition-all"></div>
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 rounded-2xl bg-on-surface-variant/10 border border-on-surface-variant/20 text-on-surface-variant flex items-center justify-center">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              inventory
            </span>
          </div>
        </div>
        <h3 className="text-on-surface-variant text-[12px] font-bold uppercase tracking-widest mb-1">
          Inventory
        </h3>
        <p className="text-[24px] md:text-[32px] font-display-lg font-bold text-on-surface tracking-tight leading-none">
          {metrics.inventoryCount.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Customers */}
      <div className="glass-card p-6 md:p-8 rounded-[24px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all"></div>
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              diversity_3
            </span>
          </div>
        </div>
        <h3 className="text-on-surface-variant text-[12px] font-bold uppercase tracking-widest mb-1">
          Customers
        </h3>
        <p className="text-[24px] md:text-[32px] font-display-lg font-bold text-on-surface tracking-tight leading-none">
          {metrics.customerCount.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}
