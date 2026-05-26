import type { DashboardMetrics } from "@/lib/admin/queries";
import { formatAdminCurrency } from "@/lib/admin/format";

type GlobalTelemetryProps = {
  metrics: DashboardMetrics;
};

export function GlobalTelemetry({ metrics }: GlobalTelemetryProps) {
  return (
    <section>
      <h2 className="font-section-header text-section-header text-on-surface-variant uppercase mb-md tracking-widest">
        Global Telemetry
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="border border-white/10 p-lg bg-black flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Total Revenue
            </span>
            {metrics.revenueChangePercent !== null && (
              <span className="text-zinc-400 text-xs flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                {metrics.revenueChangePercent >= 0 ? "+" : ""}
                {metrics.revenueChangePercent}%
              </span>
            )}
          </div>
          <div className="font-headline-md text-headline-md text-primary font-semibold tracking-tight">
            {formatAdminCurrency(metrics.totalRevenue)}
          </div>
        </div>
        <div className="border border-white/10 p-lg bg-black flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Total Orders
            </span>
          </div>
          <div className="font-headline-md text-headline-md text-primary font-semibold tracking-tight">
            {metrics.totalOrders.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="border border-white/10 p-lg bg-black flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Current Inventory Count
            </span>
          </div>
          <div className="font-headline-md text-headline-md text-primary font-semibold tracking-tight">
            {metrics.inventoryCount.toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </section>
  );
}
