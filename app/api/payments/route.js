// app/api/payments/route.js
import { NextResponse } from "next/server";
import { createStripeCheckout, createRazorpayOrder } from "@/lib/payments";
import { db } from "@/lib/firebaseAdmin";

// === Create Payment (Stripe / Razorpay) ===
export async function POST(req) {
  try {
    const { provider, bookingId, amount, currency = "INR", customer_email } =
      await req.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "bookingId & amount required" },
        { status: 400 }
      );
    }

    if (provider === "stripe") {
      const session = await createStripeCheckout({
        bookingId,
        amount,
        currency: currency.toLowerCase(), // 👈 ensure lowercase
        customer_email,
      });

      return NextResponse.json({
        ok: true,
        provider,
        id: session.id,
        url: session.url,
      });
    }

    if (provider === "razorpay") {
      const order = await createRazorpayOrder({ bookingId, amount, currency });
      return NextResponse.json({
        ok: true,
        provider,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    }

    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  } catch (e) {
    console.error("🔥 Payment init error:", e.message, e.raw || e);
    return NextResponse.json(
      { error: "Failed to create payment", detail: e.message },
      { status: 500 }
    );
  }
}

// === Fetch All Payments (for Admin Panel) ===
export async function GET() {
  try {
    const snapshot = await db
      .collection("payments")
      .orderBy("created_at", "desc")
      .limit(50)
      .get();

    const payments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ payments });
  } catch (err) {
    console.error("🔥 Failed to fetch payments:", err);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
