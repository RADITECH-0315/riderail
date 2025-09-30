// /app/api/stripe/checkout/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "../../../../lib/db";
import Booking from "../../../../models/booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (!booking.fare || !Number.isFinite(booking.fare)) {
      return NextResponse.json(
        { error: "Fare is missing or invalid for this booking" },
        { status: 400 }
      );
    }

    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: booking.email || undefined, // optional
      line_items: [
        {
          price_data: {
            currency: booking.currency || "inr",
            product_data: {
              name: `Cab Ride - ${booking.tripType}`,
              description: `${booking.pickup} → ${booking.drop} | Passengers: ${booking.passengers || 1}`,
            },
            unit_amount: Math.round(booking.fare * 100), // Convert ₹ to paise
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: booking._id.toString(),
        passengers: booking.passengers || 1,
      },
      success_url: `${process.env.STRIPE_SUCCESS_URL}?bookingId=${booking._id}`,
      cancel_url: `${process.env.STRIPE_CANCEL_URL}?bookingId=${booking._id}`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("❌ [Stripe Checkout] error:", err);
    return NextResponse.json(
      { error: err.message || "Stripe session creation failed" },
      { status: 500 }
    );
  }
}
