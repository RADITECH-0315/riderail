// app/api/webhooks/stripe/route.js
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db, FieldValue } from "@/lib/firebaseAdmin";

export async function POST(req) {
  console.log("🔥 Incoming request at /api/webhooks/stripe");

  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err) {
    console.error("❌ Stripe webhook error:", err.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // Only handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    console.log("🎉 Checkout session completed event received");
    const session = event.data.object;

    const bookingId = session.metadata?.bookingId || null;
    const paymentId = session.payment_intent || session.id;

    console.log("👉 Extracted bookingId:", bookingId);
    console.log("👉 Extracted paymentId:", paymentId);

    const paymentDoc = {
      id: paymentId,
      provider: "stripe",
      status: "paid",
      amount: session.amount_total ?? 0,
      currency: (session.currency || "inr").toUpperCase(),
      customer_email:
        session.customer_details?.email || session.customer_email || null,
      bookingId,
      created_at: FieldValue.serverTimestamp(),
    };

    try {
      // Save payment record
      await db.collection("payments").doc(paymentId).set(paymentDoc, { merge: true });

      if (bookingId) {
        // Update booking record
        await db.collection("bookings").doc(bookingId).set(
          {
            payment_status: "paid",
            payment_provider: "stripe",
            payment_id: paymentId,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        console.log(`✅ Stripe payment saved & booking updated: ${bookingId}`);
      } else {
        console.warn("⚠️ checkout.session.completed received without bookingId");
      }
    } catch (err) {
      console.error("🔥 Failed saving Stripe payment:", err);
    }
  }

  // Ignore unrelated events silently
  return NextResponse.json({ received: true });
}
