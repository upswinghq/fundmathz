"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function RootRouteRedirect() {
  const router = useRouter();
  const { configError, isLoading, user } = useAuth();

  useEffect(() => {
    if (configError || isLoading) {
      return;
    }

    router.replace(user ? "/dashboard" : "/auth");
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

  return (
    <main className="page">
      <section className="card">
        <p className="message">Loading...</p>
      </section>
    </main>
  );
}
