import { connectDB } from "@/lib/db";
import Booking from "@/models/booking";
import { computeFare } from "@/lib/fare";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";

// Create booking
export async function POST(req) {
  try {
    const body = await req.json();

    // ✅ Validate required fields
    if (!body.name || !body.phone || !body.tripType || !body.pickupTime) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // ✅ Validate pickupTime
    const pickupTime = new Date(body.pickupTime);
    if (isNaN(pickupTime.getTime())) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid pickupTime" }),
        { status: 400 }
      );
    }

    // ✅ Calculate fare
    const { fare, currency } = computeFare(body);

    // ✅ Connect DB and save booking
    await connectDB();
    const doc = await Booking.create({
      name: body.name,
      phone: body.phone,
      pickupAddress: body.pickupAddress,
      pickup: body.pickup,
      dropAddress: body.dropAddress,
      drop: body.drop,
      tripType: body.tripType,
      pickupTime,
      passengers: body.passengers || 1,
      vehicleType: body.vehicleType || "sedan",
      fare,
      currency,
      status: "pending",
    });

    // ✅ Optional WhatsApp alert
    if (process.env.ADMIN_WHATSAPP_NUMBER) {
      try {
        const msg = `🚕 New booking: ${doc.name}\nFare: ${fare} ${currency}`;
        await sendWhatsAppText(process.env.ADMIN_WHATSAPP_NUMBER, msg);
      } catch (e) {
        console.error("WhatsApp notify failed", e);
      }
    }

    return Response.json({ ok: true, bookingId: doc._id, fare, currency });
  } catch (err) {
    console.error("[/api/bookings] error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 400,
    });
  }
}

// Get recent bookings
export async function GET() {
  try {
    await connectDB();
    const items = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return Response.json({ ok: true, items });
  } catch (err) {
    console.error("[/api/bookings] error:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
    });
  }
}
