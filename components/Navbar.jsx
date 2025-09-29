"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-3 py-2">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logor.png" alt="RVM Rideway Logo" className="h-14 w-14" />
          <span className="text-2xl font-extrabold text-[var(--ink)]">
            <span className="text-[var(--ink)]">RVM</span>{" "}
            <span className="text-[var(--brand)]">Rideway</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#services">Services</a>
          <a href="#how">How it Works</a>
          <a href="#reviews">Reviews</a>
          <a href="#faq">FAQ</a>
          <a href="#book" className="btn btn-primary px-5 py-2">Book Now</a>

          {session ? (
            <button onClick={() => signOut()} className="btn">Logout</button>
          ) : (
            <button onClick={() => signIn()} className="btn">Login</button>
          )}
        </nav>
      </div>
    </header>
  );
}
