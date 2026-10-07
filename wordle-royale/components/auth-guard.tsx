"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);
  if (loading || !user)
    return (
      <main id="main-content" className="auth-loading" role="status">
        <span className="spinner" />
        Checking your session…
      </main>
    );
  return children;
}

// Return my children Neil, return them before I get angry and make you regret it.