"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const res = await signIn("credentials", { email, password, redirect: true, callbackUrl: "/bookings" });
    // signIn will handle redirect or show error via URL params if you add UI for it.
    setBusy(false);
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={busy} className="w-full bg-yellow-600 text-white rounded py-2">{busy ? "Signing in..." : "Sign in"}</button>
      </form>
      <p className="text-sm mt-4 text-gray-600">
        Don’t have an account? Ask support to create one for you.
      </p>
      <p className="text-xs mt-2"><Link href="/">← Back to Home</Link></p>
    </div>
  );
}
