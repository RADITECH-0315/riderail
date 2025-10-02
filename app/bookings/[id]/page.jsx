// /app/bookings/[id]/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "../../../lib/db";
import Booking from "../../../models/booking";
import CancelRideButton from "./CancelRideButton";

export default async function BookingDetails({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const booking = await Booking.findById(params.id).lean();

  if (!booking || booking.userId.toString() !== session.user.id) {
    redirect("/bookings");
  }

  return (
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-lg">
      <h1 className="mb-5 text-2xl font-bold text-slate-900">
        Ride Details
      </h1>

      {/* Main info section */}
      <div className="mb-6 rounded-lg border bg-slate-50 p-4">
        <p className="text-lg font-semibold text-[var(--brand)]">
          {booking.pickup} → {booking.drop}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {new Date(booking.pickupTime).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <p className="mt-2 text-base font-medium text-slate-800">
          Fare: ₹{booking.fare}
        </p>
        <p className="text-sm text-gray-500">Status: {booking.status}</p>
      </div>

      {/* Extra details */}
      <div className="space-y-2 text-gray-800 text-sm">
        <p><strong>Passengers:</strong> {booking.passengers}</p>
        <p><strong>Trip Type:</strong> {booking.tripType.replace("_", " ")}</p>
        {booking.phone && <p><strong>Phone:</strong> {booking.phone}</p>}
        {booking.email && <p><strong>Email:</strong> {booking.email}</p>}
      </div>

      {/* Cancel option */}
      {booking.status !== "cancelled" && (
        <div className="mt-6">
          <CancelRideButton bookingId={params.id} />
        </div>
      )}
    </div>
  );
}
