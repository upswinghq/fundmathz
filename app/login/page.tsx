import { AuthForm } from "@/components/AuthForm";
import { PublicOnly } from "@/components/PublicOnly";

export default function LoginPage() {
  return (
    <PublicOnly>
      <main className="page">
        <section className="card">
          <div className="stack">
            <h1>Log in</h1>
            <p>Use your email and password.</p>
          </div>
          <AuthForm mode="login" />
        </section>
      </main>
    </PublicOnly>
  );
}
