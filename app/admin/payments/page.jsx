// app/admin/payments/page.jsx
"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function PaymentsPage() {
  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    provider: "all",
    startDate: "",
    endDate: "",
  });

  const query = new URLSearchParams(filters).toString();
  const { data, isLoading } = useSWR(`/api/admin/payments?${query}`, fetcher);
  const rows = data?.payments || [];

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Payments</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          name="q"
          placeholder="Search name, phone, ID..."
          value={filters.q}
          onChange={handleChange}
          className="border p-2 rounded w-64"
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="all">Status: All</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="created">Created</option>
        </select>

        <select
          name="provider"
          value={filters.provider}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="all">Provider: All</option>
          <option value="Stripe">Stripe</option>
          <option value="Razorpay">Razorpay</option>
          <option value="UPI">UPI</option>
        </select>

        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b bg-gray-50">
              <th className="p-3">#</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Status</th>
              <th className="p-3">Payment ID</th>
              <th className="p-3">Booking</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.paymentId + idx} className="border-b">
                <td className="p-3">{idx + 1}</td>
                <td className="p-3">{r.customer}</td>
                <td className="p-3">{r.phone}</td>
                <td className="p-3">
                  ₹{r.amount?.toFixed(2)} {r.currency}
                </td>
                <td className="p-3">{r.provider}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${
                      r.status === "paid"
                        ? "bg-green-500/10 border-green-500 text-green-700"
                        : r.status === "failed"
                        ? "bg-red-500/10 border-red-500 text-red-700"
                        : "bg-yellow-500/10 border-yellow-500 text-yellow-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs">{r.paymentId}</td>
                <td className="p-3">
                  {r.booking ? (
                    <Link
                      href={`/admin/bookings?search=${r.booking}`}
                      className="text-blue-500 hover:underline font-mono text-xs"
                    >
                      {r.booking}
                    </Link>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-3">
                  {r.date ? new Date(r.date).toLocaleString() : "-"}
                </td>
              </tr>
            ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={9}>
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
