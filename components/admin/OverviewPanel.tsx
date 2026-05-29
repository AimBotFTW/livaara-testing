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
          <h1 className="font-headline-lg text-[24px] md:text-[32px] text-on-surface mb-2 font-bold tracking-tight">
            Morning, Admin
          </h1>
          <p className="text-on-surface-variant text-[14px]">
            Here is what's happening at Livaara HQ today.
          </p>
        </div>
      </header>

      <GlobalTelemetry metrics={metrics} />
      <RecentOrdersTable orders={orders} onOrderSelect={onOrderSelect} />
    </>
  );
}
