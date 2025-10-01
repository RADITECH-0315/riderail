import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "../../../lib/db";
import Booking from "../../../models/booking";
import CancelRideButton from "./CancelRideButton";

// ❌ Do NOT export any extra functions from this page file.

export default async function BookingDetails({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const booking = await Booking.findById(params.id).lean();

  if (!booking || booking.userId.toString() !== session.user.id) {
    redirect("/bookings");
  }

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-semibold">Ride Details</h1>

      <div className="space-y-3 text-gray-800">
        <p><strong>Pickup:</strong> {booking.pickup}</p>
        <p><strong>Drop:</strong> {booking.drop}</p>
        <p>
          <strong>Pickup Time:</strong>{" "}
          {new Date(booking.pickupTime).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <p><strong>Passengers:</strong> {booking.passengers}</p>
        <p><strong>Trip Type:</strong> {booking.tripType.replace("_", " ")}</p>
        <p><strong>Fare:</strong> ₹{booking.fare}</p>
        <p><strong>Status:</strong> {booking.status}</p>
      </div>

      {booking.status !== "cancelled" && (
        <CancelRideButton bookingId={params.id} />
      )}
    </div>
  );
}
