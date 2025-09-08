"use client";

import useSWR from "swr";
import { useState, useEffect, useRef } from "react";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function BookingsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [limit, setLimit] = useState(10);

  // cursor for current page; stack for back navigation
  const [cursor, setCursor] = useState(null);
  const backStackRef = useRef([]); // array of cursors we visited

  const [url, setUrl] = useState("/api/bookings");

  // 🔄 rebuild URL whenever filters/pagination change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("search", query);
    if (status) params.append("status", status);
    params.append("limit", String(limit));
    if (cursor) params.append("cursor", String(cursor));
    setUrl(`/api/bookings?${params.toString()}`);
  }, [query, status, limit, cursor]);

  const { data, mutate, isLoading } = useSWR(url, fetcher);
  const bookings = data?.bookings || [];
  const nextCursor = data?.nextCursor || null;

  async function updateStatus(id, next) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    mutate();
  }

  // 💳 Collect payment via Stripe Checkout
  async function collectPayment(b) {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "stripe",
        bookingId: b.id,
        amount: Number(b.fare), // rupees; backend multiplies by 100
        currency: b.currency || "INR",
        customer_email: b.email || undefined,
      }),
    });
    const out = await res.json();
    if (out?.session?.url) window.open(out.session.url, "_blank");
  }

  // 👉 pagination handlers
  function goNext() {
    if (nextCursor) {
      backStackRef.current.push(cursor); // push current cursor (can be null for first page)
      setCursor(nextCursor);
    }
  }
  function goPrev() {
    const prev = backStackRef.current.pop() ?? null;
    setCursor(prev);
  }
  function resetPaging() {
    backStackRef.current = [];
    setCursor(null);
  }

  // reset paging when filters change
  useEffect(() => {
    resetPaging();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, limit]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bookings</h2>

        {/* ◀️ Prev / Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={backStackRef.current.length === 0 || isLoading}
            className="px-3 py-1 rounded-xl border disabled:opacity-50"
          >
            ◀ Prev
          </button>
          <button
            onClick={goNext}
            disabled={!nextCursor || isLoading}
            className="px-3 py-1 rounded-xl border disabled:opacity-50"
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          className="p-2 rounded-xl border"
          placeholder="Search by id, name, phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="p-2 rounded-xl border"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="p-2 rounded-xl border"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* 📋 Table */}
      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">#</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Route</th>
              <th className="p-3">Created</th>
              <th className="p-3">Fare</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b hover:bg-white/5">
                <td className="p-3 font-mono text-xs">{b.id.slice(-6)}</td>
                <td className="p-3">{b.customer}</td>
                <td className="p-3">
                  {b.pickup} → {b.drop}
                </td>
                <td className="p-3">
                  {b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  {b.fare} {b.currency || "INR"}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs border ${
                      b.payment_status === "paid"
                        ? "bg-green-500/10 border-green-500"
                        : "bg-yellow-500/10 border-yellow-500"
                    }`}
                  >
                    {b.payment_status}
                  </span>
                </td>
                <td className="p-3">{b.status}</td>
                <td className="p-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(b.id, "confirmed")}
                    className="px-2 py-1 rounded-xl border"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(b.id, "assigned")}
                    className="px-2 py-1 rounded-xl border"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => updateStatus(b.id, "cancelled")}
                    className="px-2 py-1 rounded-xl border"
                  >
                    Cancel
                  </button>
                  {b.payment_status !== "paid" && (
                    <button
                      onClick={() => collectPayment(b)}
                      className="px-2 py-1 rounded-xl border bg-blue-500/10 border-blue-500"
                    >
                      Collect Payment
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && bookings.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={8}>
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
