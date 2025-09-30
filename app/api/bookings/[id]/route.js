// /app/api/bookings/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Booking from "../../../../models/booking";

// ==================
// GET /api/bookings/[id]
// ==================
export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const booking = await Booking.findById(id).lean();
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // strip internal fields
    const { _id, __v, ...rest } = booking;

    return NextResponse.json({
      ...rest,
      id: String(_id),
    });
  } catch (err) {
    console.error("[GET /api/bookings/[id]] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// ==================
// PUT /api/bookings/[id]
// ==================
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    let payload = {};
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      name,
      phone,
      tripType,
      pickup,
      drop,
      pickupTime,
      passengers,
      vehicleType,
      status,
      paymentStatus,
      upiTransactionId,
    } = payload || {};

    await connectDB();
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // ✅ Update allowed fields only
    if (name !== undefined) booking.name = name;
    if (phone !== undefined) booking.phone = phone;
    if (tripType !== undefined) booking.tripType = tripType;
    if (pickup !== undefined && pickup !== "") booking.pickup = pickup;
    if (drop !== undefined && drop !== "") booking.drop = drop;
    if (pickupTime !== undefined && pickupTime !== "")
      booking.pickupTime = pickupTime; // ✅ store as string
    if (passengers !== undefined) booking.passengers = passengers;
    if (vehicleType !== undefined) booking.vehicleType = vehicleType;
    if (status !== undefined) booking.status = status;
    if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
    if (upiTransactionId !== undefined) booking.upiTransactionId = upiTransactionId;

    await booking.save();

    const { _id, __v, ...rest } = booking.toObject();

    return NextResponse.json({
      ok: true,
      booking: {
        ...rest,
        id: String(_id),
      },
    });
  } catch (err) {
    console.error("[PUT /api/bookings/[id]] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}
