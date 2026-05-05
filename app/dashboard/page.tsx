import { DashboardManager } from "@/components/DashboardManager";
import { ProtectedContent } from "@/components/ProtectedContent";

export default function DashboardPage() {
  return (
    <ProtectedContent>
      <main className="page page-top">
        <DashboardManager />
      </main>
    </ProtectedContent>
  );
}
