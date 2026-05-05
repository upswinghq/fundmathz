"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

type PublicOnlyProps = {
  children: ReactNode;
};

export function PublicOnly({ children }: PublicOnlyProps) {
  const router = useRouter();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return (
      <main className="page">
        <section className="card">
          <p className="message">Loading...</p>
        </section>
      </main>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
