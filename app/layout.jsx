export const metadata = {
  metadataBase: new URL("https://example.com"), // replace with real domain later
  title:
    "RVM Rideway Safe & Secure Travels – Airport & Outstation Cabs in Chennai",
  description:
    "Book safe, secure, and on-time airport transfers, outstation trips, and rentals in Chennai. Transparent pricing, professional drivers, 24/7 support.",
  keywords: [
    "Chennai airport taxi",
    "Chennai airport cab",
    "outstation cabs chennai",
    "rental cabs chennai",
    "RVM Rideway Safe and Secure Travels",
  ],
  openGraph: {
    title: "RVM Rideway – Safe & Secure Cabs in Chennai",
    description:
      "Airport, outstation and rental rides with professional drivers. Book now.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

import "./globals.css";
import Navbar from "@/components/Navbar"; 
import Script from "next/script"; // ✅ already imported

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Navbar */}
        <Navbar />

        {/* ✅ Page Content */}
        {children}

        {/* ✅ Footer */}
        <footer className="mt-16 border-t bg-white">
          <div className="container flex flex-col items-center gap-2 py-8 text-center text-sm text-[var(--muted)] sm:flex-row sm:justify-between sm:text-left">
            <p>
              © {new Date().getFullYear()} RVM Rideway Safe and Secure Travels
            </p>
            <p>📧 support@rvmrideway.com • 📱 WhatsApp: +91-XXXXXXXXXX</p>
          </div>
        </footer>

        {/* ✅ Razorpay Script injected correctly */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
