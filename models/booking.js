// /models/booking.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * TIME NOTE:
 * pickupTime is a STRING in local time "YYYY-MM-DDTHH:mm"
 * Keep it as-is to avoid UTC shifts on serverless.
 */
const BookingSchema = new Schema(
  {
    // Customer
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,

    // Trip
    tripType: {
      type: String,
      enum: ["airport_city", "city_airport", "city_city", "outstation", "rental", "local"],
      required: true,
    },

    // Locations
    pickup:   { type: String, required: true },
    pickupLat:{ type: Number, required: true },
    pickupLon:{ type: Number, required: true },

    drop:     { type: String, required: true },
    dropLat:  { type: Number, required: true },
    dropLon:  { type: Number, required: true },

    // Time (local string, not Date)
    pickupTime: { type: String, required: true }, // e.g. "2025-10-01T11:45"

    // Ride
    passengers: { type: Number, default: 1, min: 1 },
    vehicleType: { type: String, enum: ["sedan", "suv", "premium"], default: "sedan" },

    // Calculated
    distanceKm: Number,
    durationMin: Number,
    fare: Number,
    currency: { type: String, default: "INR" },

    // Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "assigned", "completed", "cancelled"],
      default: "pending",
    },

    // Payments
    paymentOrderId: String, // gateway order id (if used)
    paymentStatus: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    upiTransactionId: String,
    stripeSessionId: String,
    stripePaymentIntentId: String,

    // Invoice
    invoiceId: String, // set after payment success

    // Messaging
    whatsappMessageId: String,
    emailMessageId: String,

    // Driver
    assignedDriverId: String,

    // Misc
    meta: Schema.Types.Mixed,

    // Optional auth link
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
