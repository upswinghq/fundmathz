"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function enablePersistence() {
      const auth = getFirebaseAuth();

      if (!auth) {
        return;
      }

      await setPersistence(auth, browserLocalPersistence);
    }

    void enablePersistence();
  }, []);

  async function handleAuth() {
    setMessage("");
    setIsSubmitting(true);
    const auth = getFirebaseAuth();

    if (!auth) {
      setMessage("Firebase Auth is only available in the browser.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (mode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
        router.replace("/");
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Something went wrong.";
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="form"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void handleAuth();
      }}
    >
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
        />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Please wait..." : mode === "signup" ? "Sign up" : "Log in"}
      </button>

      <p className="message">{message}</p>
      <p className="message">
        {mode === "signup" ? (
          <>
            Already have an account? <Link href="/login">Log in</Link>
          </>
        ) : (
          <>
            Need an account? <Link href="/signup">Sign up</Link>
          </>
        )}
      </p>
    </form>
  );
}
