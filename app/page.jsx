import BookingForm from '@/components/BookingForm';
import { ShieldCheck, Clock as ClockIcon, CreditCard, Star } from 'lucide-react';
import Script from 'next/script';

export default function Page() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "RVM Rideway Safe and Secure Travels",
    "image": "logo.png",
    "description": "Airport, outstation and rental cabs in Chennai with professional drivers.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Chennai",
      "addressRegion": "TN",
      "addressCountry": "IN"
    },
    "areaServed": "Chennai",
    "url": "https://example.com",
    "telephone": "+91-XXXXXXXXXX"
  };

  return (
    <main>
      <Script
        id="ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center px-6 pb-36 pt-24 text-center">
          <div className="reveal">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              Safe • Secure • On-Time
            </p>
            <h1 className="mx-auto max-w-4xl text-4xl font-black text-[var(--ink)] sm:text-5xl">
              Airport & Outstation Cabs in{' '}
              <span className="text-[var(--brand)]">Chennai</span>
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-[var(--muted)]">
              Transparent pricing, professional drivers and 24/7 support. Book
              in seconds.
            </p>
            <div className="mt-6">
              <a href="#book" className="btn btn-primary">
                Book Your Ride
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING FORM (centered) */}
     <div id="book" className="mx-auto mt-12 w-full max-w-3xl px-4 sm:px-6 lg:px-8 scroll-mt-28">
  <BookingForm />
</div>


      {/* SERVICES / TRUST */}
      <section id="services" className="mx-auto mt-20 w-full max-w-[1400px] px-6 scroll-mt-28">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={<ShieldCheck className="h-6 w-6" />} title="Safe & Verified">
            Drivers are verified and trained for airport & highway operations.
          </Feature>
          <Feature icon={<ClockIcon className="h-6 w-6" />} title="On-Time Guarantee">
            Punctual pickups with live dispatch coordination.
          </Feature>
          <Feature icon={<CreditCard className="h-6 w-6" />} title="Easy Payments">
            UPI / Cards (India) and international cards via Stripe.
          </Feature>
          <Feature icon={<Star className="h-6 w-6" />} title="Top Rated Service">
            Friendly chauffeurs and clean, well-maintained cars.
          </Feature>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto mt-20 w-full max-w-[1400px] px-6 scroll-mt-28">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-[var(--ink)]">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Step n="1" t="Tell us your trip">
            Pickup, drop, date & time—takes under 30 seconds.
          </Step>
          <Step n="2" t="Pay securely">
            Pay online; you’ll get instant confirmation.
          </Step>
          <Step n="3" t="Ride safe">
            We assign a driver & keep you updated via WhatsApp/email.
          </Step>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="mx-auto mt-20 w-full max-w-[1400px] px-6 scroll-mt-28">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-[var(--ink)]">
          What customers say
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Review
            name="Sanjay K."
            text="Clean car, on time at MAA airport. Transparent fare—recommended!"
          />
          <Review
            name="Priya R."
            text="Booked an outstation run to Pondy. Professional driver and smooth ride."
          />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto mt-20 w-full max-w-[1400px] px-6 scroll-mt-28">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-[var(--ink)]">
          FAQ
        </h2>
        <div className="grid gap-4">
          <Faq q="Do you support UPI and international cards?">
            Yes—UPI & cards via Razorpay in India, and cards via Stripe for
            international customers.
          </Faq>
          <Faq q="Will I get booking updates on WhatsApp?">
            Yes—after confirmation, you’ll receive automatic WhatsApp & email
            messages.
          </Faq>
          <Faq q="Are prices final?">
            Airport↔City is flat; rentals/outstation show estimates—final price
            shared before trip starts.
          </Faq>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto mt-24 w-full max-w-[1400px] px-6 scroll-mt-28">
        <div className="card flex flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="text-2xl font-extrabold text-[var(--ink)]">
              Ready to ride?
            </h3>
            <p className="text-[var(--muted)]">
              Book your safe & secure cab in under a minute.
            </p>
          </div>
          <a href="#book" className="btn btn-primary">
            Book Now
          </a>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, children }) {
  return (
    <div className="reveal card p-5">
      <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-[var(--ink)]">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[var(--ink)]">{title}</h3>
      <p className="mt-1 text-[var(--muted)]">{children}</p>
    </div>
  );
}

function Step({ n, t, children }) {
  return (
    <div className="reveal card p-6">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] font-bold text-[var(--ink)]">
        {n}
      </div>
      <h4 className="text-lg font-bold text-[var(--ink)]">{t}</h4>
      <p className="mt-1 text-[var(--muted)]">{children}</p>
    </div>
  );
}

function Review({ name, text }) {
  return (
    <div className="reveal card p-6">
      <div className="flex items-center gap-2 text-yellow-500" aria-hidden>
        <Star className="h-5 w-5 fill-yellow-500" />
        <Star className="h-5 w-5 fill-yellow-500" />
        <Star className="h-5 w-5 fill-yellow-500" />
        <Star className="h-5 w-5 fill-yellow-500" />
        <Star className="h-5 w-5 fill-yellow-500" />
      </div>
      <p className="mt-3 text-[var(--ink)]">{text}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">— {name}</p>
    </div>
  );
}

function Faq({ q, children }) {
  return (
    <details className="reveal card group p-5">
      <summary className="cursor-pointer list-none">
        <span className="text-[var(--ink)]">{q}</span>
      </summary>
      <div className="mt-2 text-[var(--muted)] group-open:animate-[reveal_.35s_ease-out_both]">
        {children}
      </div>
    </details>
  );
}
