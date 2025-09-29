"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

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
    const res = await signIn("credentials", {
      email: email.trim(),
      password: password.trim(),
      redirect: false, // ⬅️ prevent auto redirect so we can check for errors
      callbackUrl: "/bookings",
    });

    if (res?.error) {
      setError("Invalid email or password.");
    } else if (res?.ok) {
      window.location.href = "/bookings"; // ⬅️ manual redirect
    }

    setBusy(false);
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-yellow-600 text-white rounded py-2 hover:bg-yellow-700 transition disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <p className="text-sm mt-4 text-gray-600">
        Don’t have an account? Ask support to create one for you.
      </p>
      <p className="text-xs mt-2">
        <Link href="/">← Back to Home</Link>
      </p>
    </div>
  );
}
