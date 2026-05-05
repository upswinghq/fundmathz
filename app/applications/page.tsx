import { ApplicationsManager } from "@/components/ApplicationsManager";
import { ProtectedContent } from "@/components/ProtectedContent";

export default function ApplicationsPage() {
  return (
    <ProtectedContent>
      <main className="page page-top">
        <ApplicationsManager />
      </main>
    </ProtectedContent>
  );
}
