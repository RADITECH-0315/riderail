// /models/booking.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * IMPORTANT ABOUT TIME:
 * - Store pickupTime as a STRING in local time (e.g. "2025-10-01T11:45")
 *   so MongoDB/Node won't auto-convert it to UTC.
 * - When displaying, format with:
 *     new Date(booking.pickupTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", ... })
 */
const BookingSchema = new Schema(
  {
    // Customer Info
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },

    // Trip Info
    tripType: {
      type: String,
      enum: ["airport_city", "city_airport", "city_city", "outstation", "rental", "local"],
      required: true,
    },

    // Pickup & Drop (labels/addresses + coordinates)
    pickup:   { type: String, required: true },
    pickupLat:{ type: Number, required: true },
    pickupLon:{ type: Number, required: true },

    drop:     { type: String, required: true },
    dropLat:  { type: Number, required: true },
    dropLon:  { type: Number, required: true },

    // Store as local string "YYYY-MM-DDTHH:mm"
    pickupTime: { type: String, required: true },

    // Ride Info
    passengers: { type: Number, default: 1 },
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "premium"],
      default: "sedan",
    },

    // Distance & Fare
    distanceKm: Number,
    durationMin: Number, // <- your APIs compute this; keep it
    fare: Number,
    currency: { type: String, default: "INR" },

    // Booking Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "assigned", "completed", "cancelled"],
      default: "pending",
    },

    // Payment Tracking
    paymentOrderId: String,
    paymentStatus: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    upiTransactionId: String,

    // Notifications
    whatsappMessageId: String,
    emailMessageId: String,

    // Driver Assignment
    assignedDriverId: String,

    // Misc metadata (e.g., distanceSource)
    meta: Schema.Types.Mixed,

    // Link to logged-in user
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
