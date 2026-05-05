import Link from "next/link";
import { ProtectedContent } from "@/components/ProtectedContent";

export default function HomePage() {
  return (
    <ProtectedContent>
      <main className="page">
        <section className="card">
          <div className="stack">
            <h1>Welcome</h1>
            <p>You are signed in.</p>
            <p>
              <Link href="/opportunities">Go to opportunities</Link>
            </p>
            <p>
              <Link href="/applications">Go to applications</Link>
            </p>
            <p>
              <Link href="/dashboard">Go to dashboard</Link>
            </p>
          </div>
        </section>
      </main>
    </ProtectedContent>
  );
}
