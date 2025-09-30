// /app/api/bookings/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Booking from "../../../models/booking";
import { getDistanceAndDuration } from "../../../lib/distance";
import { computeFare } from "../../../lib/fare";
import { geocodeAddress, getFixedCoords } from "../../../lib/location";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

// ==================
// POST /api/bookings -> Create a new booking
// ==================
export async function POST(req) {
  try {
    const payload = await req.json();
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
    } = payload || {};

    if (!name || !phone || !pickup || !drop || !pickupTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // --- Origin
    let origin = getFixedCoords(pickup);
    if (!origin) {
      if (pickupLat && pickupLon) {
        origin = { lat: Number(pickupLat), lon: Number(pickupLon) };
      } else {
        origin = await geocodeAddress(pickup);
      }
    }

    // --- Destination
    let dest = getFixedCoords(drop);
    if (!dest) {
      if (dropLat && dropLon) {
        dest = { lat: Number(dropLat), lon: Number(dropLon) };
      } else {
        dest = await geocodeAddress(drop);
      }
    }

    // --- Distance & duration
    const { distanceKm, durationMin, mode } = await getDistanceAndDuration(
      origin,
      dest
    );
    if (!Number.isFinite(distanceKm) || !Number.isFinite(durationMin)) {
      return NextResponse.json(
        { error: "Distance calculation failed" },
        { status: 502 }
      );
    }

    // --- Fare
    const { fare, currency } = computeFare({
      tripType,
      distanceKm,
      durationMin,
    });

    if (!fare || !Number.isFinite(fare)) {
      return NextResponse.json(
        { error: "Fare calculation failed. Please try again." },
        { status: 502 }
      );
    }

    await connectDB();

    // --- User session (if logged in)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    // --- Save booking (aligned with schema)
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
      pickupTime, // ✅ keep raw local string
      passengers: passengers || 1,
      vehicleType: vehicleType || "sedan",
      distanceKm,
      durationMin,
      fare,
      currency,
      meta: { distanceSource: mode || "unknown" },
      userId,
    });

    return NextResponse.json({
      ok: true,
      id: String(doc._id),
    });
  } catch (err) {
    console.error("[POST /api/bookings] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

// ==================
// GET /api/bookings -> List all bookings
// ==================
export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      bookings.map((b) => ({
        ...b,
        id: String(b._id),
      }))
    );
  } catch (err) {
    console.error("[GET /api/bookings] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
