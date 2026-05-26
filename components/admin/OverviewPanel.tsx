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
      <GlobalTelemetry metrics={metrics} />
      <RecentOrdersTable orders={orders} onOrderSelect={onOrderSelect} />
    </>
  );
}
