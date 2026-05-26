"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCustomerAction, deleteCustomerAction } from "@/app/admin/actions";
import type { CustomerDirectoryRow } from "@/lib/admin/queries";

type CustomerDrawerProps = {
  customer: CustomerDirectoryRow | null;
  onClose: () => void;
};

const inputClass =
  "w-full bg-stone-950 border border-stone-800/50 px-md py-sm font-body-sm text-body-sm text-stone-200 focus:outline-none focus:border-[#C8A96A]/50 mt-xs";
const labelClass =
  "font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest block";

export function CustomerDrawer({ customer, onClose }: CustomerDrawerProps) {
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const isOpen = Boolean(customer);

  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
    }
  }, [customer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    startTransition(async () => {
      const result = await updateCustomerAction(customer.id, {
        name,
        email,
        phone,
      });

      if (result.ok) {
        toast.success("Customer updated successfully");
        onClose();
      } else {
        toast.error(result.error ?? "Failed to update customer");
      }
    });
  };

  const handleDelete = () => {
    if (!customer) return;
    if (!window.confirm("Are you sure you want to delete this customer? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCustomerAction(customer.id);
      if (result.ok) {
        toast.success("Customer deleted successfully");
        onClose();
      } else {
        toast.error(result.error ?? "Failed to delete customer");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 z-[9999] w-[420px] h-screen bg-stone-950 border-l border-stone-800 flex flex-col shadow-2xl overflow-y-auto text-stone-200">
        <div className="flex justify-between items-center px-lg h-16 border-b border-stone-800 shrink-0">
          <div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Edit Customer
            </p>
            <p className="font-headline-md text-headline-md text-[#C8A96A] font-semibold tracking-tight">
              {customer?.name || "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-sm text-stone-400 hover:text-[#C8A96A] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-lg space-y-lg">
          <form onSubmit={handleSave} className="space-y-md">
            <section className="border border-stone-800 p-lg bg-black space-y-md">
              <h3 className="font-section-header text-section-header text-stone-400 uppercase tracking-widest">
                Profile Info
              </h3>
              <div>
                <label className={labelClass}>Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
            </section>

            <button
              type="submit"
              disabled={pending}
              className="w-full font-button text-button uppercase px-md py-sm border border-[#C8A96A] bg-[#C8A96A] text-black hover:bg-[#C8A96A]/90 transition-colors cursor-pointer disabled:opacity-40"
            >
              {pending ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <section className="border border-stone-800 p-lg bg-black mt-lg">
            <h3 className="font-section-header text-section-header text-stone-400 uppercase tracking-widest mb-md">
              Danger Zone
            </h3>
            <p className="font-body-sm text-body-sm text-stone-400 mb-md">
              Deleting a customer is permanent. Customers with existing orders cannot be deleted.
            </p>
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="w-full font-button text-button uppercase px-md py-sm border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-40"
            >
              {pending ? "Deleting..." : "Delete Customer"}
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
