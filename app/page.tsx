import { PublicOnly } from "@/components/PublicOnly";

export default function HomePage() {
  return (
    <PublicOnly>
      <main className="page">
        <section className="card">
          <div className="stack">
            <h1>FundMaths</h1>
            <p>Please log in to continue.</p>
          </div>
        </section>
      </main>
    </PublicOnly>
  );
}
