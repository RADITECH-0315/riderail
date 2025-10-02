// app/admin/payments/page.jsx
"use client";

import useSWR from "swr";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function PaymentsPage() {
  const { data, isLoading } = useSWR("/api/payments", fetcher);
  const rows = data?.payments || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Payments</h2>

      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">#</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment ID</th>
              <th className="p-3">Booking</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3 font-mono text-xs">{r.id.slice(-6)}</td>
                <td className="p-3">{r.customer_email || "-"}</td>
                <td className="p-3">
                  {(r.amount / 100).toFixed(2)} {r.currency || "INR"}
                </td>
                <td className="p-3">{r.provider || "-"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${
                      r.status === "paid"
                        ? "bg-green-500/10 border-green-500"
                        : "bg-yellow-500/10 border-yellow-500"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">{r.id}</td>
                <td className="p-3">
                  {r.bookingId ? (
                    <Link
                      href={`/admin/bookings?search=${r.bookingId}`}
                      className="text-blue-500 hover:underline font-mono text-xs"
                    >
                      {r.bookingId}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={7}>
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
