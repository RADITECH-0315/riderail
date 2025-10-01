// /app/login/page.jsx
"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setBusy(true);

    try {
      // Try login
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        setBusy(false);
        return;
      }

      // Check session to know if user is admin or customer
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/#book";
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4 text-center">Sign in</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-[var(--brand)] text-slate-900 font-semibold rounded py-2 hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <p className="text-sm mt-4 text-gray-600 text-center">
        Don’t have an account?{" "}
        <Link href="/register" className="underline text-[var(--brand)]">
          Create one
        </Link>
      </p>
      <p className="text-xs mt-2 text-center">
        <Link href="/">← Back to Home</Link>
      </p>
    </div>
  );
}
