"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ThankYouPage() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId"); // Stripe metadata → we’ll pass bookingId here

  useEffect(() => {
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      }).catch(console.error);
    }
  }, [bookingId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600">🎉 Payment Successful!</h1>
      <p className="mt-4 text-gray-700">
        Thank you for your booking. Your payment has been received.
      </p>
      <a
        href="/admin/bookings"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Go to Bookings
      </a>
    </div>
  );
}
