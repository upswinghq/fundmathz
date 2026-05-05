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
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

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
