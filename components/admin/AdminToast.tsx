"use client";

import { Toaster } from "sonner";

export function AdminToast() {
  return (
    <Toaster
      position="bottom-center"
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "border border-white/10 bg-black text-primary font-body-sm text-body-sm rounded-none shadow-none",
          title: "text-primary font-label-caps text-label-caps uppercase",
          description: "text-on-surface-variant",
        },
      }}
    />
  );
}
