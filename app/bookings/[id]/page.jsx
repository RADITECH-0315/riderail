// /app/bookings/[id]/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "../../../lib/db";
import Booking from "../../../models/booking";
import CancelRideButton from "./CancelRideButton"; // ✅ client component

// ✅ Server Action must be exported at top level
export async function cancelRideAction(id) {
  "use server"; // ✅ marks this as server action
  await connectDB();
  await Booking.findByIdAndUpdate(id, { status: "cancelled" });
  redirect("/bookings"); // after cancel, go back to bookings list
}

export default async function BookingDetails({ params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const booking = await Booking.findById(params.id).lean();

  if (!booking || booking.userId.toString() !== session.user.id) {
    redirect("/bookings");
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Ride Details</h1>

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
        <CancelRideButton bookingId={params.id} cancelRideAction={cancelRideAction} />
      )}
    </div>
  );
}
