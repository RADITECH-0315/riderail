"use client";
import { useState, useTransition } from "react";

export default function CancelRideButton({ bookingId, cancelRideAction }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(() => {
      cancelRideAction(bookingId); // ✅ safely call server action
    });
  }

  return (
    <>
      {/* Cancel button */}
      <button
        onClick={() => setOpen(true)}
        className="mt-6 w-full bg-red-600 text-white rounded py-2 hover:bg-red-700 transition"
      >
        Cancel Ride
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-3">Cancel Ride?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel this ride? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                No, keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
