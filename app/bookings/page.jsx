// /app/bookings/page.jsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";
import { redirect } from "next/navigation";
import { connectDB } from "../../lib/db";
import Booking from "../../models/booking";
import Link from "next/link";

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await connectDB();
  const bookings = await Booking.find({
    userId: session.user.id,
    status: { $in: ["pending", "confirmed"] }, // ✅ only active rides
  })
    .sort({ pickupTime: 1 })
    .lean();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Upcoming Rides</h1>
      {bookings.length === 0 && <p className="text-gray-600">No rides yet.</p>}
      <ul className="space-y-3">
        {bookings.map((b) => (
          <li
            key={b._id}
            className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition cursor-pointer"
          >
            <Link href={`/bookings/${b._id}`} className="block">
              <div className="font-medium">{b.pickup} → {b.drop}</div>
              <div className="text-sm text-gray-700">
                {new Date(b.pickupTime).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                {" • "}
                {b.tripType.replace("_", " ")} • ₹{b.fare} • {b.passengers} pax
              </div>
              <div className="text-xs text-gray-500">
                Status: {b.status}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
