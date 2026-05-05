import { OpportunitiesManager } from "@/components/OpportunitiesManager";
import { ProtectedContent } from "@/components/ProtectedContent";

export default function OpportunitiesPage() {
  return (
    <ProtectedContent>
      <main className="page page-top">
        <OpportunitiesManager />
      </main>
    </ProtectedContent>
  );
}
