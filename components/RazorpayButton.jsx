"use client";
import { useState } from "react";

export default function RazorpayButton({ bookingId, amount = 500 }) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);

    try {
      // 1. Ask backend to create Razorpay order
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "razorpay",
          bookingId,
          amount,
          currency: "INR",
        }),
      });

      const data = await res.json();
      console.log("🔗 Razorpay order response:", data);

      // 2. Configure Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "RVM Rideway",
        description: `Booking ${bookingId}`,
        notes: { bookingId },
        prefill: { email: "test@example.com" },
        handler: function (response) {
          console.log("✅ Razorpay success:", response);
          alert("Payment successful!");
        },
        modal: {
          ondismiss: function () {
            console.warn("⚠️ Razorpay popup closed by user");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("🔥 Razorpay init error:", err);
      alert("Payment failed to start");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      {loading ? "Processing..." : "Pay with Razorpay"}
    </button>
  );
}
