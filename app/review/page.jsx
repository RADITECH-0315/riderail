"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // ✅ Fetch booking details
  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        setBooking(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookingId]);

  async function handlePay() {
    if (!bookingId) return;
    setPaying(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url; // ✅ redirect to Stripe Checkout
      } else {
        alert(data.error || "Payment failed to start.");
      }
    } catch (err) {
      alert("Error starting payment");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return <p className="text-center p-6">Loading your booking...</p>;
  }

  if (!booking) {
    return <p className="text-center p-6 text-red-500">Booking not found.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md space-y-6">
      <h1 className="text-xl font-bold text-slate-900 text-center">
        Review Your Booking
      </h1>

      <div className="space-y-2 text-slate-700">
        <p><strong>Name:</strong> {booking.name}</p>
        <p><strong>Phone:</strong> {booking.phone}</p>
        <p><strong>Trip Type:</strong> {booking.tripType}</p>
        <p><strong>Pickup:</strong> {booking.pickup}</p> {/* ✅ schema aligned */}
        <p><strong>Drop:</strong> {booking.drop}</p>     {/* ✅ schema aligned */}
        <p><strong>Date & Time:</strong>{" "}
          {new Date(booking.pickupTime).toLocaleString()}
        </p>
        <p><strong>Fare:</strong> ₹{booking.fare}</p>
      </div>

      <button
        onClick={handlePay}
        disabled={paying}
        className="w-full py-3 rounded-lg bg-[var(--brand)] text-slate-900 font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
      >
        {paying ? "Redirecting to Payment..." : "Pay Now"}
      </button>
    </div>
  );
}
