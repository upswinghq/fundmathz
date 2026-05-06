import type { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthGate } from "@/components/AuthGate";

type AuthenticatedLayoutProps = {
  children: ReactNode;
};

export default function AuthenticatedLayout({
  children
}: AuthenticatedLayoutProps) {
  return (
    <AuthGate>
      <div className="app-shell">
        <AppSidebar />
        <main className="app-main">{children}</main>
      </div>
    </AuthGate>
  );
}
