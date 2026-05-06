"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

type ProtectedContentProps = {
  children: ReactNode;
};

export function ProtectedContent({ children }: ProtectedContentProps) {
  const router = useRouter();
  const { configError, isLoading, user } = useAuth();

  useEffect(() => {
    if (!configError && !isLoading && !user) {
      router.replace("/login");
    }
  }, [configError, isLoading, router, user]);

  if (configError) {
    return (
      <main className="page">
        <section className="card">
          <div className="stack">
            <h1>Firebase Setup Required</h1>
            <p>{configError}</p>
          </div>
        </section>
      </main>
    );
  }

  if (isLoading || !user) {
    return (
      <main className="page">
        <section className="card">
          <p className="message">Loading...</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
