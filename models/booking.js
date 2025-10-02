// models/booking.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Booking Schema
 * - pickupTime stored as string "YYYY-MM-DDTHH:mm" (local time)
 * - passengers included
 * - professional payment + ride status handling
 */
const BookingSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,

    tripType: {
      type: String,
      enum: [
        "airport_city",
        "city_airport",
        "city_city",
        "outstation",
        "rental",
        "local",
      ],
      required: true,
    },

    pickup: { type: String, required: true },
    pickupLat: { type: Number, required: true },
    pickupLon: { type: Number, required: true },

    drop: { type: String, required: true },
    dropLat: { type: Number, required: true },
    dropLon: { type: Number, required: true },

    pickupTime: { type: String, required: true }, // stored as local string

    passengers: { type: Number, default: 1, min: 1 },
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "premium"],
      default: "sedan",
    },

    distanceKm: Number,
    durationMin: Number,
    fare: Number,
    currency: { type: String, default: "INR" },

    // Ride status
    status: {
      type: String,
      enum: ["pending", "confirmed", "assigned", "completed", "cancelled"],
      default: "pending",
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",   // ✅ always start as pending
    },

    paymentOrderId: String,
    upiTransactionId: String,
    stripeSessionId: String,
    stripePaymentIntentId: String,

    invoiceId: String,

    whatsappMessageId: String,
    emailMessageId: String,

    assignedDriverId: String,
    meta: Schema.Types.Mixed,

    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
