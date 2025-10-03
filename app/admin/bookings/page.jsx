"use client";

import { useEffect, useMemo, useState } from "react";

function classNames(...a) {
  return a.filter(Boolean).join(" ");
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    payment: "all",
    driver: "all", // all | assigned | unassigned
    startDate: "",
    endDate: "",
  });

  const [modal, setModal] = useState({
    open: false,
    booking: null,
    mode: "manual", // "existing" | "manual"
    selectedDriverId: "",
    name: "",
    phone: "",
    carNumber: "",
    modelName: "",
    vehicleType: "",
    busy: false,
    error: "",
  });

  const params = useMemo(
    () => new URLSearchParams(filters).toString(),
    [filters]
  );

  const fetchBookings = async () => {
    const res = await fetch(`/api/admin/bookings?${params}`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (data.success) setBookings(data.bookings);
  };

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const res = await fetch("/api/admin/drivers?active=1", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Drivers API not available");
      const data = await res.json();
      setDrivers(data.drivers || []);
    } catch {
      setDrivers([]); // fallback
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [params]);

  const driverTab = filters.driver;

  const openAssignModal = (booking) => {
    setModal({
      open: true,
      booking,
      mode: "manual", // default to manual
      selectedDriverId: booking?.driver?.driverId || "",
      name: "",
      phone: "",
      carNumber: "",
      modelName: "",
      vehicleType: "",
      busy: false,
      error: "",
    });
    if (!drivers.length) fetchDrivers();
  };

  const closeModal = () =>
    setModal((m) => ({ ...m, open: false, error: "", busy: false }));

  const assign = async () => {
    if (!modal.booking?._id) return;
    setModal((m) => ({ ...m, busy: true, error: "" }));

    try {
      const payload =
        modal.mode === "existing"
          ? { driverId: modal.selectedDriverId }
          : {
              name: modal.name,
              phone: modal.phone,
              carNumber: modal.carNumber,
              modelName: modal.modelName,
              vehicleType: modal.vehicleType,
            };

      const res = await fetch(
        `/api/admin/bookings/${modal.booking._id}/assign-driver`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      closeModal();
      fetchBookings();
    } catch (e) {
      setModal((m) => ({
        ...m,
        busy: false,
        error: e.message || "Failed to assign",
      }));
    }
  };

  const unassign = async (booking) => {
    try {
      await fetch(`/api/admin/bookings/${booking._id}/assign-driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: null }),
      });
      fetchBookings();
    } catch {
      // no-op
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Bookings</h1>

      {/* Driver split tabs */}
      <div className="mb-4 flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "assigned", label: "Assigned" },
          { key: "unassigned", label: "Not Assigned" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilters((f) => ({ ...f, driver: t.key }))}
            className={classNames(
              "px-3 py-1 rounded border text-sm",
              driverTab === t.key
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search name/phone/pickup/drop"
          className="border p-2 rounded"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
        />

        <select
          className="border p-2 rounded"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="assigned">Assigned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          className="border p-2 rounded"
          value={filters.payment}
          onChange={(e) => setFilters({ ...filters, payment: e.target.value })}
        >
          <option value="all">Payment: All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>

      {/* Table */}
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Name</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Pickup → Drop</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Payment</th>
                <th className="border p-2">Driver</th>
                <th className="border p-2">Fare</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="align-top">
                  <td className="border p-2">{b.name}</td>
                  <td className="border p-2">{b.phone}</td>
                  <td className="border p-2">
                    <div className="max-w-[520px] whitespace-pre-wrap">
                      {b.pickup} → {b.drop}
                    </div>
                  </td>
                  <td className="border p-2">{b.status}</td>
                  <td className="border p-2">{b.paymentStatus}</td>
                  <td className="border p-2">
                    {b.status === "assigned" && b.driver && b.driver.name ? (
                      <div className="text-xs">
                        <div className="font-medium text-green-700">
                          Assigned
                        </div>
                        <div>
                          {b.driver.name} · {b.driver.phone}
                        </div>
                        <div>
                          {b.driver.modelName} ({b.driver.vehicleType}) •{" "}
                          {b.driver.carNumber}
                        </div>
                      </div>
                    ) : (
                      <span className="text-red-500">Not Assigned</span>
                    )}
                  </td>
                  <td className="border p-2">₹{b.fare}</td>
                  <td className="border p-2">
                    {new Date(b.createdAt).toLocaleString()}
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 text-xs border rounded hover:bg-gray-50"
                        onClick={() => openAssignModal(b)}
                      >
                        {b.status === "assigned" && b.driver?.name
                          ? "Change Driver"
                          : "Assign Driver"}
                      </button>
                      {b.driver?.driverId && (
                        <button
                          className="px-3 py-1 text-xs border rounded text-red-600 hover:bg-red-50"
                          onClick={() => unassign(b)}
                        >
                          Unassign
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Assign Driver</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            {modal.booking && (
              <div className="text-sm mb-4 text-gray-700">
                <div className="font-medium mb-1">
                  {modal.booking.name} ({modal.booking.phone})
                </div>
                <div className="mb-1">
                  {modal.booking.pickup} → {modal.booking.drop}
                </div>
                <div className="text-gray-500">
                  Pickup: {modal.booking.pickupTime || "-"}
                </div>
              </div>
            )}

            {/* Toggle Mode */}
            <div className="flex gap-4 mb-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={modal.mode === "existing"}
                  onChange={() => setModal((m) => ({ ...m, mode: "existing" }))}
                />
                Select Existing Driver
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={modal.mode === "manual"}
                  onChange={() => setModal((m) => ({ ...m, mode: "manual" }))}
                />
                Enter New Driver
              </label>
            </div>

            {/* Existing Driver Dropdown */}
            {modal.mode === "existing" && (
              <div className="mb-4">
                {loadingDrivers ? (
                  <div className="text-sm text-gray-500">Loading drivers…</div>
                ) : drivers.length > 0 ? (
                  <select
                    className="border rounded p-2 w-full"
                    value={modal.selectedDriverId}
                    onChange={(e) =>
                      setModal((m) => ({
                        ...m,
                        selectedDriverId: e.target.value,
                      }))
                    }
                  >
                    <option value="">— Choose driver —</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} · {d.phone} · {d.modelName} ({d.vehicleType}) •{" "}
                        {d.carNumber}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-amber-600">
                    No drivers found. Please create one manually.
                  </div>
                )}
              </div>
            )}

            {/* Manual Entry Form */}
            {modal.mode === "manual" && (
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Driver Name"
                  className="border rounded p-2 w-full"
                  value={modal.name}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, name: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Phone"
                  className="border rounded p-2 w-full"
                  value={modal.phone}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, phone: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Car Number"
                  className="border rounded p-2 w-full"
                  value={modal.carNumber}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, carNumber: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Model Name"
                  className="border rounded p-2 w-full"
                  value={modal.modelName}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, modelName: e.target.value }))
                  }
                />
                <select
                  className="border rounded p-2 w-full"
                  value={modal.vehicleType}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, vehicleType: e.target.value }))
                  }
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            )}

            {modal.error && (
              <div className="mb-3 text-sm text-red-600">{modal.error}</div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-1 text-sm border rounded"
                onClick={closeModal}
                disabled={modal.busy}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 text-sm rounded bg-slate-900 text-white disabled:opacity-60"
                onClick={assign}
                disabled={
                  modal.busy ||
                  (modal.mode === "existing" && !modal.selectedDriverId) ||
                  (modal.mode === "manual" && (!modal.name || !modal.phone))
                }
              >
                {modal.busy ? "Saving…" : "Assign Driver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
