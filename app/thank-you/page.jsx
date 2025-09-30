"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id") || searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setBooking(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookingId]);

  if (loading)
    return <p className="text-center p-6">Loading your booking...</p>;
  if (!booking)
    return (
      <p className="text-center p-6 text-red-500">
        Booking not found. Please contact support.
      </p>
    );

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-md space-y-6 text-slate-800">
      <h1 className="text-2xl font-bold text-center text-green-600">
        ✅ Payment Successful!
      </h1>
      <p className="text-center text-gray-600">
        Thank you for your booking. Here are your ride details:
      </p>
      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {booking.name}
        </p>
        <p>
          <strong>Phone:</strong> {booking.phone}
        </p>
        <p>
          <strong>Trip Type:</strong> {booking.tripType}
        </p>
        <p>
          <strong>Pickup:</strong> {booking.pickup || booking.pickupAddress}
        </p>
        <p>
          <strong>Drop:</strong> {booking.drop || booking.dropAddress}
        </p>
        <p>
          <strong>Date & Time:</strong>{" "}
          {new Date(booking.pickupTime).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>

        <p>
          <strong>Fare:</strong> ₹{booking.fare}
        </p>
        <p>
          <strong>Status:</strong> {booking.status}
        </p>
        <p>
          <strong>Payment Status:</strong> {booking.paymentStatus}
        </p>
      </div>
      <div className="text-center mt-6">
        <a
          href="/"
          className="inline-block bg-[var(--brand)] px-6 py-3 rounded-lg font-semibold text-slate-900 hover:bg-yellow-500 transition"
        >
          Book Another Ride
        </a>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<p className="text-center p-6">Loading booking...</p>}>
      <ThankYouContent />
    </Suspense>
  );
}
