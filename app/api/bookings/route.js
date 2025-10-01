// /app/api/bookings/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Booking from "../../../models/booking";
import { getDistanceAndDuration } from "../../../lib/distance";
import { computeFare } from "../../../lib/fare";
import { geocodeAddress, getFixedCoords } from "../../../lib/location";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

// POST /api/bookings -> Create booking
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    // ✅ Enforce login
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to book a ride." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      phone,
      email,
      tripType,
      pickup,
      drop,
      pickupTime,
      pickupLat,
      pickupLon,
      dropLat,
      dropLon,
      passengers,
      vehicleType,
    } = body || {};

    if (!name || !phone || !tripType || !pickup || !drop || !pickupTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Coordinates
    let origin = getFixedCoords(pickup);
    if (!origin) {
      if (Number.isFinite(pickupLat) && Number.isFinite(pickupLon)) {
        origin = { lat: Number(pickupLat), lon: Number(pickupLon) };
      } else {
        origin = await geocodeAddress(pickup);
      }
    }
    let dest = getFixedCoords(drop);
    if (!dest) {
      if (Number.isFinite(dropLat) && Number.isFinite(dropLon)) {
        dest = { lat: Number(dropLat), lon: Number(dropLon) };
      } else {
        dest = await geocodeAddress(drop);
      }
    }
    if (!origin?.lat || !origin?.lon || !dest?.lat || !dest?.lon) {
      return NextResponse.json({ error: "Invalid locations" }, { status: 400 });
    }

    // ✅ Distance + Fare
    const { distanceKm, durationMin, mode } = await getDistanceAndDuration(origin, dest);
    const { fare, currency } = computeFare({ tripType, distanceKm, durationMin });

    if (!Number.isFinite(fare)) {
      return NextResponse.json({ error: "Fare calculation failed" }, { status: 502 });
    }

    await connectDB();

    // ✅ Create booking with userId
    const doc = await Booking.create({
      name,
      phone,
      email,
      tripType,
      pickup,
      pickupLat: origin.lat,
      pickupLon: origin.lon,
      drop,
      dropLat: dest.lat,
      dropLon: dest.lon,
      pickupTime, // local string
      passengers: passengers ?? 1,
      vehicleType: vehicleType || "sedan",
      distanceKm,
      durationMin,
      fare,
      currency,
      paymentStatus: "created",
      meta: { distanceSource: mode || "unknown" },
      userId: session.user.id,
    });

    return NextResponse.json({ ok: true, id: String(doc._id) });
  } catch (err) {
    console.error("[POST /api/bookings] error:", err);
    return NextResponse.json({ error: err.message || "Failed to create booking" }, { status: 500 });
  }
}

// GET /api/bookings -> List all bookings (admin)
export async function GET() {
  try {
    await connectDB();
    const rows = await Booking.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(
      rows.map((b) => ({
        ...b,
        id: String(b._id),
      }))
    );
  } catch (err) {
    console.error("[GET /api/bookings] error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch bookings" }, { status: 500 });
  }
}
