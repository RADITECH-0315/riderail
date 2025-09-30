// /app/api/stripe/webhook/route.js
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "../../../../lib/db";
import Booking from "../../../../models/booking";

export const runtime = "nodejs"; // ensure Node runtime for crypto

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // set in Vercel

export async function POST(req) {
  const buf = await req.arrayBuffer();
  const sig = headers().get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const bookingId = session.metadata?.bookingId;
      if (!bookingId) return NextResponse.json({ ok: true });

      await connectDB();
      const booking = await Booking.findById(bookingId);
      if (!booking) return NextResponse.json({ ok: true }); // ignore if missing

      // mark as paid + assign invoice id
      booking.paymentStatus = "paid";
      booking.status = "confirmed";
      booking.stripePaymentIntentId = session.payment_intent || "";
      if (!booking.invoiceId) {
        booking.invoiceId = `INV-${String(booking._id).slice(-6).toUpperCase()}`;
      }
      await booking.save();
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
