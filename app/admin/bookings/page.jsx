"use client";

import { useEffect, useState } from "react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then(async (data) => {
        if (data?.bookings) {
          // ✅ fetch fare info for each booking
          const enriched = await Promise.all(
            data.bookings.map(async (b) => {
              try {
                const fareRes = await fetch("/api/fare", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tripType: b.tripType,
                    pickupLat: b.pickupLat,
                    pickupLon: b.pickupLon,
                    dropLat: b.dropLat,
                    dropLon: b.dropLon,
                  }),
                });
                const fareData = await fareRes.json();
                return { ...b, ...fareData };
              } catch {
                return b;
              }
            })
          );
          setBookings(enriched);
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center p-6">Loading bookings...</p>;
  }

  if (!bookings.length) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">No bookings yet 🚖</h2>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-8">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
        📋 All Bookings
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-200 text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Trip Type</th>
              <th className="px-4 py-2 border">Pickup</th>
              <th className="px-4 py-2 border">Drop</th>
              <th className="px-4 py-2 border">Pickup Time</th>
              <th className="px-4 py-2 border">Distance (km)</th>
              <th className="px-4 py-2 border">Duration (min)</th>
              <th className="px-4 py-2 border">Fare</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => (
              <tr key={i} className="text-center">
                <td className="px-4 py-2 border">{b.name}</td>
                <td className="px-4 py-2 border">{b.phone}</td>
                <td className="px-4 py-2 border">{b.tripType}</td>
                <td className="px-4 py-2 border">{b.pickup}</td>
                <td className="px-4 py-2 border">{b.drop}</td>
                <td className="px-4 py-2 border">
                  {new Date(b.pickupTime).toLocaleString()}
                </td>
                <td className="px-4 py-2 border">
                  {b.distanceKm ? `${b.distanceKm} km` : "-"}
                </td>
                <td className="px-4 py-2 border">
                  {b.durationMin ? `${b.durationMin} min` : "-"}
                </td>
                <td className="px-4 py-2 border font-semibold">
                  {b.currency ? `${b.currency} ${b.fare}` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
