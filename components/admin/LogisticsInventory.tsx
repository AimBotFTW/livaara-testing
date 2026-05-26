"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateInventoryAction, seedInitialProductAction } from "@/app/admin/actions";
import type { AdminProductRow } from "@/lib/admin/queries";
import { formatAdminCurrency } from "@/lib/admin/format";

type LogisticsInventoryProps = {
  products: AdminProductRow[];
};

export function LogisticsInventory({ products }: LogisticsInventoryProps) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(products.map((p) => [p.id, p.inventory_count])),
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setCounts(Object.fromEntries(products.map((p) => [p.id, p.inventory_count])));
  }, [products]);

  const adjust = (productId: string, delta: number) => {
    setCounts((prev) => {
      const next = Math.max(0, (prev[productId] ?? 0) + delta);
      return { ...prev, [productId]: next };
    });
  };

  const save = (productId: string) => {
    const count = counts[productId] ?? 0;
    startTransition(async () => {
      const result = await updateInventoryAction(productId, count);
      if (result.ok) {
        toast.success("Inventory updated");
        router.refresh();
      } else {
        toast.error(result.error ?? "Update failed");
      }
    });
  };

  const handleSeed = () => {
    startTransition(async () => {
      const result = await seedInitialProductAction();
      if (result.ok) {
        toast.success("Initial product added");
        router.refresh();
      } else {
        toast.error(result.error ?? "Seeding failed");
      }
    });
  };

  return (
    <section>
      <h2 className="font-section-header text-section-header text-on-surface-variant uppercase mb-md tracking-widest">
        Inventory
      </h2>
      <div className="border border-white/10 bg-black overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                Product
              </th>
              <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                SKU Price
              </th>
              <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-center">
                Stock
              </th>
              <th className="py-sm px-lg font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="py-xl px-lg text-center">
                  <div className="flex flex-col items-center justify-center gap-md">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      No products in catalog
                    </span>
                    <button
                      type="button"
                      disabled={pending}
                      className="font-button text-button uppercase tracking-widest px-md py-sm border border-[#C8A96A]/50 text-[#C8A96A] hover:bg-[#C8A96A]/10 hover:border-[#C8A96A] transition-colors cursor-pointer disabled:opacity-50"
                      onClick={handleSeed}
                    >
                      {pending ? "Seeding..." : "Add Initial Product"}
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-white/5 transition-colors">
                <td className="py-md px-lg font-body-sm text-body-sm text-primary font-medium">
                  {product.name}
                  {!product.is_active && (
                    <span className="ml-sm font-label-caps text-label-caps text-stone-500 uppercase">
                      (inactive)
                    </span>
                  )}
                </td>
                <td className="py-md px-lg font-body-sm text-body-sm text-on-surface-variant">
                  {formatAdminCurrency(product.price)}
                </td>
                <td className="py-md px-lg">
                  <div className="flex items-center justify-center gap-sm">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => adjust(product.id, -1)}
                      className="w-8 h-8 border border-white/10 text-on-surface-variant hover:text-[#C8A96A] hover:border-[#C8A96A]/50 transition-colors cursor-pointer disabled:opacity-40 font-button text-button"
                      aria-label="Decrease stock"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={counts[product.id] ?? 0}
                      onChange={(e) =>
                        setCounts((prev) => ({
                          ...prev,
                          [product.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                        }))
                      }
                      className="w-16 text-center bg-stone-950 border border-stone-800/50 py-xs font-body-sm text-body-sm text-stone-200 focus:outline-none focus:border-[#C8A96A]/50"
                    />
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => adjust(product.id, 1)}
                      className="w-8 h-8 border border-white/10 text-on-surface-variant hover:text-[#C8A96A] hover:border-[#C8A96A]/50 transition-colors cursor-pointer disabled:opacity-40 font-button text-button"
                      aria-label="Increase stock"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="py-md px-lg text-right">
                  <button
                    type="button"
                    disabled={pending || counts[product.id] === product.inventory_count}
                    onClick={() => save(product.id)}
                    className="font-button text-button uppercase px-md py-sm border border-white/10 text-on-surface-variant hover:text-[#C8A96A] hover:border-[#C8A96A]/50 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
