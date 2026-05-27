import { GlobalTelemetry } from "./GlobalTelemetry";
import { RecentOrdersTable } from "./RecentOrdersTable";
import type { DashboardMetrics, RecentOrderRow } from "@/lib/admin/queries";

type OverviewPanelProps = {
  metrics: DashboardMetrics;
  orders: RecentOrderRow[];
  onOrderSelect: (orderId: string) => void;
};

export function OverviewPanel({ metrics, orders, onOrderSelect }: OverviewPanelProps) {
  return (
    <>
      {/* Welcome Header */}
      <header className="mb-8 md:mb-12 flex justify-between items-end">
        <div>
          <h1 className="font-headline-lg text-[24px] md:text-[32px] text-on-surface mb-2 font-bold tracking-tight">Morning, Admin</h1>
          <p className="text-on-surface-variant text-[14px]">Here is what's happening at Livaara HQ today.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface-container-highest px-4 py-2 rounded-xl border border-white/5 text-on-surface-variant font-label-sm text-[12px] font-bold flex items-center gap-2 hover:bg-surface-container-high transition-colors cursor-pointer active:scale-95">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span className="hidden md:inline">Last 30 Days</span>
          </button>
        </div>
      </header>

      <GlobalTelemetry metrics={metrics} />
      <RecentOrdersTable orders={orders} onOrderSelect={onOrderSelect} />
    </>
  );
}
