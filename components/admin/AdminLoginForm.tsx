"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/app/admin/actions";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await loginAction(email, password);
      if (result.ok) {
        const redirect = searchParams.get("redirect") || "/admin";
        router.push(redirect);
        router.refresh();
      } else {
        setError(result.error ?? "Sign in failed");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone-950 p-[32px]">
      <div className="w-full min-w-[320px] max-w-[448px] shrink-0 border border-stone-800/50 bg-stone-950 p-[32px]">
        <p className="font-label-caps text-label-caps text-stone-500 uppercase tracking-widest text-center">
          Livaara Admin
        </p>
        <h1 className="font-headline-md text-headline-md text-stone-200 text-center mt-sm tracking-tight">
          Sign In
        </h1>
        <form onSubmit={handleSubmit} className="mt-xl space-y-md">
          <div>
            <label
              htmlFor="email"
              className="font-label-caps text-label-caps text-stone-500 uppercase tracking-widest block mb-xs"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[44px] bg-stone-950 border border-stone-800/50 px-md py-sm font-body-sm text-body-sm text-stone-200 focus:outline-none focus:border-[#C8A96A]/50"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="font-label-caps text-label-caps text-stone-500 uppercase tracking-widest block mb-xs"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-[44px] bg-stone-950 border border-stone-800/50 px-md py-sm font-body-sm text-body-sm text-stone-200 focus:outline-none focus:border-[#C8A96A]/50"
            />
          </div>
          {error && (
            <p className="font-body-sm text-body-sm text-red-400/90 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-[44px] font-button text-button uppercase tracking-widest px-md border border-stone-800/50 text-stone-200 hover:bg-stone-800/40 hover:border-[#C8A96A]/50 hover:text-[#C8A96A] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
          >
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
