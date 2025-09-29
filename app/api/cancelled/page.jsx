"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CancelledPage() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId");

  useEffect(() => {
    if (bookingId) {
      fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      }).catch(console.error);
    }
  }, [bookingId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600">❌ Payment Cancelled</h1>
      <p className="mt-4 text-gray-700">
        Your payment was not completed. Please try again.
      </p>
      <a
        href="/"
        className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg"
      >
        Back to Home
      </a>
    </div>
  );
}
