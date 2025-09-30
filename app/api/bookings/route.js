// /app/api/bookings/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Booking from "../../../models/booking";
import { getDistanceAndDuration } from "../../../lib/distance";
import { computeFare } from "../../../lib/fare";
import { geocodeAddress, getFixedCoords } from "../../../lib/location";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions"; // if you have auth; safe if not logged in

// POST /api/bookings  -> Create booking
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      tripType,
      pickup,
      drop,
      pickupTime,   // "YYYY-MM-DDTHH:mm" local string (from <input type="datetime-local" />)
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

    // Resolve origin coords
    let origin = getFixedCoords(pickup);
    if (!origin) {
      if (Number.isFinite(pickupLat) && Number.isFinite(pickupLon)) {
        origin = { lat: Number(pickupLat), lon: Number(pickupLon) };
      } else {
        origin = await geocodeAddress(pickup);
      }
    }

    // Resolve destination coords
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

    // Distance + Duration
    const { distanceKm, durationMin, mode } = await getDistanceAndDuration(origin, dest);
    if (!Number.isFinite(distanceKm) || !Number.isFinite(durationMin)) {
      return NextResponse.json({ error: "Distance calculation failed" }, { status: 502 });
    }

    // Fare
    const { fare, currency } = computeFare({ tripType, distanceKm, durationMin });
    if (!Number.isFinite(fare)) {
      return NextResponse.json({ error: "Fare calculation failed" }, { status: 502 });
    }

    await connectDB();

    // Optional session
    let userId = null;
    try {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id || null;
    } catch (_) {}

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
      pickupTime,                 // keep LOCAL STRING
      passengers: passengers ?? 1,
      vehicleType: vehicleType || "sedan",
      distanceKm,
      durationMin,
      fare,
      currency,
      paymentStatus: "created",
      meta: { distanceSource: mode || "unknown" },
      userId,
    });

    return NextResponse.json({ ok: true, id: String(doc._id) });
  } catch (err) {
    console.error("[POST /api/bookings] error:", err);
    return NextResponse.json({ error: err.message || "Failed to create booking" }, { status: 500 });
  }
}

// GET /api/bookings  -> List bookings (admin/list use)
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
