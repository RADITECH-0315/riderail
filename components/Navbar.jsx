"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-3 py-2">
        {/* ✅ Logo + Brand */}
        <Link href="/" className="flex items-center gap-3">
          {/* Bigger logo */}
          <img src="/logor.png" alt="RVM Rideway Logo" className="h-14 w-14 sm:h-16 sm:w-16" />
          <span className="text-xl sm:text-2xl font-extrabold text-[var(--ink)]">
            <span className="text-[var(--ink)]">RVM</span>{" "}
            <span className="text-[var(--brand)]">Rideway</span>
          </span>
        </Link>

        {/* ✅ Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 text-base font-medium text-[var(--ink)]">
          <a href="#services" className="hover:text-[var(--brand)] transition-colors">
            Services
          </a>
          <a href="#how" className="hover:text-[var(--brand)] transition-colors">
            How it Works
          </a>
          <a href="#reviews" className="hover:text-[var(--brand)] transition-colors">
            Reviews
          </a>
          <a href="#faq" className="hover:text-[var(--brand)] transition-colors">
            FAQ
          </a>
          <a href="#book" className="btn btn-primary px-5 py-2 text-sm sm:text-base">
            Book Now
          </a>
        </nav>

        {/* ✅ Mobile Menu Button */}
        <button
          className="md:hidden text-[var(--ink)]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* ✅ Mobile Nav */}
      {open && (
        <div className="md:hidden border-t bg-white/95 backdrop-blur">
          <nav className="flex flex-col gap-4 p-4 text-base font-medium text-[var(--ink)]">
            <a href="#services" className="hover:text-[var(--brand)] transition-colors">
              Services
            </a>
            <a href="#how" className="hover:text-[var(--brand)] transition-colors">
              How it Works
            </a>
            <a href="#reviews" className="hover:text-[var(--brand)] transition-colors">
              Reviews
            </a>
            <a href="#faq" className="hover:text-[var(--brand)] transition-colors">
              FAQ
            </a>
            <a href="#book" className="btn btn-primary w-full text-center py-2">
              Book Now
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
