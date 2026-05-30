import type { OrderStatus } from "@/lib/types/database";

export function formatOrderDisplayId(id: string): string {
  return `ORD-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}

export function formatAdminCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAdminDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function orderStatusLabel(status: OrderStatus): string {
  if (status === "pending") return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function orderStatusDotClass(status: OrderStatus): string {
  switch (status) {
    case "shipped":
      return "bg-[#3b82f6]";
    case "delivered":
      return "bg-[#86efac]";
    case "processing":
    case "pending":
    default:
      return "bg-[#facc15]";
  }
}

export function truncateReview(text: string, max = 48): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

const ORDER_FLOW = ["processing", "shipped", "delivered"] as const;

export function nextOrderStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_FLOW.indexOf(current as (typeof ORDER_FLOW)[number]);
  if (idx === -1) return "processing";
  if (idx >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[idx + 1];
}
