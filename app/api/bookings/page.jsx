"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function MyBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/bookings/my")
        .then((res) => res.json())
        .then((data) => {
          setBookings(data.bookings || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (!session?.user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">My Rides</h1>
        <p className="text-gray-600">⚠️ Please login to view your rides.</p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-center p-6">Loading your rides...</p>;
  }

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.pickupTime) > now);
  const past = bookings.filter((b) => new Date(b.pickupTime) <= now);

  async function cancelRide(id) {
    if (!confirm("Are you sure you want to cancel this ride?")) return;

    const res = await fetch(`/api/bookings/${id}/cancel`, { method: "PUT" });
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
      );
    } else {
      alert("❌ Failed to cancel ride. Try again.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Rides</h1>

      {/* Upcoming Rides */}
      <section id="upcoming" className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          🚖 Upcoming Rides ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-600">No upcoming rides booked yet.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((b) => (
              <RideCard key={b._id} ride={b} onCancel={cancelRide} />
            ))}
          </div>
        )}
      </section>

      {/* Past Rides */}
      <section id="past">
        <h2 className="text-xl font-semibold mb-4">
          📜 Past Rides ({past.length})
        </h2>
        {past.length === 0 ? (
          <p className="text-gray-600">No past rides found.</p>
        ) : (
          <div className="space-y-4">
            {past.map((b) => (
              <RideCard key={b._id} ride={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RideCard({ ride, onCancel }) {
  const canCancel = ["pending", "confirmed", "assigned"].includes(ride.status);

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold capitalize">
          {ride.tripType.replace("_", " → ")}
        </p>
        <span
          className={`text-xs px-2 py-1 rounded ${
            ride.status === "completed"
              ? "bg-green-100 text-green-700"
              : ride.status === "cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {ride.status}
        </span>
      </div>

      <p>
        📍 <strong>Pickup:</strong> {ride.pickupAddress}
      </p>
      <p>
        🏁 <strong>Drop:</strong> {ride.dropAddress}
      </p>
      <p>
        🕒 <strong>Pickup Time:</strong>{" "}
        {ride.pickupTime ? new Date(ride.pickupTime).toLocaleString() : "N/A"}
      </p>
      <p>👥 <strong>Passengers:</strong> {ride.passengers || 1}</p>
      <p>🚘 <strong>Vehicle:</strong> {ride.vehicleType || "sedan"}</p>

      <div className="flex justify-between items-center mt-3 text-sm">
        <span className="font-medium">
          💰 Fare: ₹{ride.fare ? Number(ride.fare).toFixed(0) : "—"}
        </span>
        <span
          className={`px-2 py-1 rounded ${
            ride.paymentStatus === "paid"
              ? "bg-green-100 text-green-700"
              : ride.paymentStatus === "failed"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {ride.paymentStatus}
        </span>
      </div>

      {/* Cancel button */}
      {onCancel && canCancel && ride.status !== "cancelled" && (
        <button
          onClick={() => onCancel(ride._id)}
          className="mt-3 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Cancel Ride
        </button>
      )}
    </div>
  );
}
