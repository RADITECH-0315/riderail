// app/admin/login/page.jsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl: "/admin", // after login, go to dashboard
    });
    setLoading(false);
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 bg-white/5 p-6 rounded-2xl border"
      >
        <h1 className="text-2xl font-semibold">Admin Login</h1>

        <input
          className="w-full p-3 rounded-xl border bg-transparent"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 rounded-xl border bg-transparent"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full p-3 rounded-xl border hover:bg-white/10"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
