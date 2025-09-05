'use client';

import { motion } from 'framer-motion';
import { Car, CheckCircle2 } from 'lucide-react';

export default function BookingSuccess({ bookingId, fare }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className="flex flex-col items-center gap-4 rounded-2xl bg-white px-8 py-6 text-center shadow-2xl ring-1 ring-black/5"
    >
      {/* 🚖 Car Icon + Check */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex items-center justify-center gap-3"
      >
        <Car className="h-10 w-10 text-amber-500 drop-shadow" />
        <CheckCircle2 className="h-10 w-10 text-green-600 drop-shadow" />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-2xl font-bold text-slate-900"
      >
        Booking Confirmed
      </motion.h3>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-1 text-sm text-slate-600"
      >
        <p>
          Reference: <span className="font-semibold text-slate-800">{bookingId}</span>
        </p>
        <p>
          Fare: <span className="font-semibold text-green-700">₹{fare}</span>
        </p>
      </motion.div>
    </motion.div>
  );
}
