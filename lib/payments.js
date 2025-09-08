// lib/payments.js
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";

// --- Stripe Setup ---
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// --- Razorpay Setup ---
const razor =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

/**
 * ✅ Create a Stripe Checkout Session
 */
export async function createStripeCheckout({
  bookingId,
  amount,
  currency = "INR",
  customer_email,
}) {
  if (!stripe) throw new Error("Stripe not configured");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: `RVM Booking ${bookingId}` },
          unit_amount: amount * 100, // ✅ convert INR → paise
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId }, // ✅ Link back to booking
    customer_email,
    // ✅ Use STRIPE_SUCCESS_URL and STRIPE_CANCEL_URL from .env
    success_url: `${process.env.STRIPE_SUCCESS_URL}?bookingId=${bookingId}`,
    cancel_url: `${process.env.STRIPE_CANCEL_URL}?bookingId=${bookingId}`,
  });

  return {
    id: session.id,
    url: session.url, // ✅ Important: return checkout link
  };
}

/**
 * ✅ Create a Razorpay Order
 */
export async function createRazorpayOrder({
  bookingId,
  amount,
  currency = "INR",
}) {
  if (!razor) throw new Error("Razorpay not configured");

  const order = await razor.orders.create({
    amount: amount * 100, // ✅ INR → paise
    currency,
    receipt: `booking_${bookingId}`,
    notes: { bookingId },
  });

  return order; // {id, amount, currency, ...}
}

/**
 * ✅ Verify Razorpay Payment Signature
 */
export function verifyRazorpayPaymentSignature({
  order_id,
  payment_id,
  signature,
}) {
  const body = `${order_id}|${payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expected === signature;
}
