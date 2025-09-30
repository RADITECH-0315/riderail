// /models/booking.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * Booking Schema
 *
 * IMPORTANT: pickupTime is stored as a STRING in local time
 *   (format: "YYYY-MM-DDTHH:mm").
 * This prevents automatic UTC conversion by MongoDB.
 * Always format for display using:
 *
 *   new Date(booking.pickupTime).toLocaleString("en-IN", {
 *     timeZone: "Asia/Kolkata",
 *     day: "2-digit",
 *     month: "short",
 *     year: "numeric",
 *     hour: "2-digit",
 *     minute: "2-digit",
 *     hour12: true,
 *   })
 */
const BookingSchema = new Schema(
  {
    /** Customer Info */
    name:   { type: String, required: true },
    phone:  { type: String, required: true },
    email:  { type: String },

    /** Trip Info */
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

    /** Pickup & Drop Info */
    pickup:    { type: String, required: true }, // address/label
    pickupLat: { type: Number, required: true },
    pickupLon: { type: Number, required: true },

    drop:      { type: String, required: true }, // address/label
    dropLat:   { type: Number, required: true },
    dropLon:   { type: Number, required: true },

    /** Time (store as string, not Date) */
    pickupTime: { type: String, required: true }, // e.g. "2025-10-01T11:45"

    /** Ride Info */
    passengers:  { type: Number, default: 1 },
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "premium"],
      default: "sedan",
    },

    /** Distance & Fare */
    distanceKm: Number,
    durationMin: Number,
    fare: Number,
    currency: { type: String, default: "INR" },

    /** Booking Status */
    status: {
      type: String,
      enum: ["pending", "confirmed", "assigned", "completed", "cancelled"],
      default: "pending",
    },

    /** Payment Tracking */
    paymentOrderId: String,
    paymentStatus: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    upiTransactionId: String,

    /** Notifications */
    whatsappMessageId: String,
    emailMessageId: String,

    /** Driver Assignment */
    assignedDriverId: String,

    /** Misc metadata (like distance source, API logs, etc.) */
    meta: Schema.Types.Mixed,

    /** Link to logged-in user (if registered) */
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
