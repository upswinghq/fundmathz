import { AuthForm } from "@/components/AuthForm";
import { PublicOnly } from "@/components/PublicOnly";

export default function SignupPage() {
  return (
    <PublicOnly>
      <main className="page">
        <section className="card">
          <div className="stack">
            <h1>Sign up</h1>
            <p>Create an account with your email and password.</p>
          </div>
          <AuthForm mode="signup" />
        </section>
      </main>
    </PublicOnly>
  );
}
