// /app/api/bookings/mine/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Booking from "@/models/booking";

// ==================
// GET /api/bookings/mine -> List current user's bookings
// ==================
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch only this user's bookings
    const bookings = await Booking.find({ userId: session.user.id })
      .sort({ pickupTime: 1 }) // sort by upcoming first
      .lean();

    return NextResponse.json(
      bookings.map((b) => ({
        id: String(b._id),
        tripType: b.tripType,
        pickup: b.pickupAddress,
        drop: b.dropAddress,
        pickupTime: b.pickupTime,
        status: b.status,
        fare: b.fare,
        paymentStatus: b.paymentStatus,
      }))
    );
  } catch (err) {
    console.error("[GET /api/bookings/mine] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch user bookings" },
      { status: 500 }
    );
  }
}
