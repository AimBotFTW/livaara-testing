import { AdminShell } from "@/components/admin/AdminShell";
import { getAllReviews } from "@/app/actions/reviews";
import {
  getAdminProducts,
  getDashboardMetrics,
  getRecentOrders,
  getCustomersDirectory,
} from "@/lib/admin/queries";

export default async function AdminPage() {
  const [metrics, orders, reviews, products, customers] = await Promise.all([
    getDashboardMetrics(),
    getRecentOrders(50),
    getAllReviews(),
    getAdminProducts(),
    getCustomersDirectory(),
  ]);

  return (
    <AdminShell
      metrics={metrics}
      orders={orders}
      reviews={reviews}
      products={products}
      customers={customers}
    />
  );
}
