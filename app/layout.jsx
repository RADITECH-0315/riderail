// /app/layout.jsx
import "./globals.css";
import AuthProvider from "../components/AuthProvider";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "RVM Rideway – Safe & Secure Cab Booking",
  description: "Airport transfers, outstation trips, and rentals in & around Chennai.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {/* ✅ Single source of truth for the nav */}
          <Navbar />

          {children}

          {/* FOOTER */}
          <footer id="contact" className="mt-20 bg-slate-900 text-slate-200">
            <div className="w-full max-w-[1400px] mx-auto py-10 px-6 sm:px-12 grid gap-8 sm:grid-cols-3">
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
                <p className="text-sm text-slate-300">rvmrideway@gmail.com</p>
                <p className="text-sm text-slate-300">WhatsApp: +91-9003409690</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Quick Links</h4>
                <div className="flex flex-col gap-1 text-sm">
                  <a href="/#book" className="hover:text-white">Book now</a>
                  <a href="/#how" className="hover:text-white">How it works</a>
                  <a href="/#reviews" className="hover:text-white">Reviews</a>
                  <a href="/login" className="hover:text-white">Login</a>
                  <a href="/register" className="hover:text-white">Sign up</a>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} RVM Rideway Safe & Secure Travels • Chennai
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
