import type { Metadata } from "next";
import "./admin.css";
import { AdminToast } from "@/components/admin/AdminToast";

export const metadata: Metadata = {
  title: "Mission Control",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className="dark admin-mission-control min-h-screen h-screen overflow-hidden">
        {children}
        <AdminToast />
      </div>
    </>
  );
}
