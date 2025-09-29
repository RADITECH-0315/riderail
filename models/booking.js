// /models/booking.js
import mongoose, { Schema } from "mongoose";

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

    // Pickup & Drop Info
    pickup: { type: String, required: true }, // label/address
    pickupLat: { type: Number, required: true },
    pickupLon: { type: Number, required: true },

    drop: { type: String, required: true }, // label/address
    dropLat: { type: Number, required: true },
    dropLon: { type: Number, required: true },

    pickupTime: { type: Date, required: true },

    // Ride Info
    passengers: { type: Number, default: 1 },
    vehicleType: {
      type: String,
      enum: ["sedan", "suv", "premium"],
      default: "sedan",
    },

    // Distance & Fare
    distanceKm: Number,
    fare: Number,

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
    upiTransactionId: { type: String },

    // Notifications
    whatsappMessageId: String,
    emailMessageId: String,

    // Driver Assignment
    assignedDriverId: String,

    // Link to logged-in user
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
