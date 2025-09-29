import "./globals.css";

export const metadata = {
  title: "RVM Rideway – Safe & Secure Cab Booking",
  description:
    "Airport transfers, outstation trips, and rentals in & around Chennai.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Top Nav (simple + responsive) */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b shadow-sm">
          <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between py-3 px-6 sm:px-12">
            {/* Logo + Brand */}
            <a href="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="RVM Rideways"
                className="h-14 w-14 sm:h-16 sm:w-16 drop-shadow-md"
              />
              <span className="text-xl sm:text-2xl font-extrabold tracking-wide text-slate-900">
                RVM{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  RIDEWAYS
                </span>
              </span>
            </a>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-10 text-slate-700 text-base sm:text-lg font-medium">
              <a className="hover:text-[var(--brand)] transition" href="#book">
                Book
              </a>
              <a className="hover:text-[var(--brand)] transition" href="#how">
                How it works
              </a>
              <a
                className="hover:text-[var(--brand)] transition"
                href="#reviews"
              >
                Reviews
              </a>
              <a
                className="hover:text-[var(--brand)] transition"
                href="#contact"
              >
                Contact
              </a>
            </nav>
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer id="contact" className="mt-20 bg-slate-900 text-slate-200">
          <div className="container py-10 grid gap-8 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <img src="/logo.png" alt="RVM" className="h-8 w-8" />
                <span>RVM Rideway</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Safe, secure & on-time cabs across Chennai.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contact</h4>
              <p className="text-sm text-slate-300">For support, email us at rvmrideway@gmail.com</p>
              <p className="text-sm text-slate-300">WhatsApp: +91-9003409690</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quick Links</h4>
              <div className="flex flex-col gap-1 text-sm">
                <a href="#book" className="hover:text-white">
                  Book now
                </a>
                <a href="#how" className="hover:text-white">
                  How it works
                </a>
                <a href="#reviews" className="hover:text-white">
                  Reviews
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} RVM Rideway Safe & Secure Travels •
            Chennai
          </div>
        </footer>
      </body>
    </html>
  );
}
