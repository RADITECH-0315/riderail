import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },

    pickupAddress: String,
    pickupLat: Number,
    pickupLng: Number,

    dropAddress: String,
    dropLat: Number,
    dropLng: Number,

    // ✅ tripType now includes "airport_city"
    tripType: {
      type: String,
      enum: ["local", "outstation", "rental", "airport", "airport_city"],
      required: true,
    },

    pickupTime: Date,
    passengers: { type: Number, default: 1 },
    vehicleType: { type: String, default: "sedan" },

    distanceKm: Number,
    durationMin: Number,

    fare: Number,
    currency: { type: String, default: process.env.DEFAULT_CURRENCY || "INR" },

    status: {
      type: String,
      enum: ["pending", "confirmed", "assigned", "completed", "cancelled"],
      default: "pending",
    },

    whatsappMessageId: String,
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
