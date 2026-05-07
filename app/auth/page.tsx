"use client";

import { useState } from "react";
import { AuthForm } from "@/components/AuthForm";
import { PublicOnly } from "@/components/PublicOnly";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <PublicOnly>
      <main className="page">
        <section className="card">
          <div className="stack">
            <h1>{mode === "login" ? "Log in" : "Sign up"}</h1>
            <p>
              {mode === "login"
                ? "Use your email and password."
                : "Create an account with your email and password."}
            </p>
          </div>

          <div className="auth-switch">
            <button
              type="button"
              className={mode === "login" ? "auth-switch-button auth-switch-button-active" : "auth-switch-button"}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === "signup" ? "auth-switch-button auth-switch-button-active" : "auth-switch-button"}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <AuthForm mode={mode} />
        </section>
      </main>
    </PublicOnly>
  );
}
