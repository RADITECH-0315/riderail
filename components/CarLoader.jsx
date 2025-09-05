'use client';

import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

export default function CarLoader({ show, text = 'Processing your booking…' }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl bg-neutral-900/80 px-8 py-6 shadow-2xl ring-1 ring-white/10">
        {/* Road lane + moving car */}
        <div className="relative mx-auto mb-5 h-16 w-72 overflow-hidden">
          {/* subtle road baseline */}
          <div className="absolute inset-x-0 bottom-2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          {/* shimmering guide line */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="absolute top-1/2 h-[2px] w-1/3 -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
          />
          {/* car glide */}
          <motion.div
            initial={{ x: -60 }}
            animate={{ x: 280 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
            className="absolute bottom-0 left-0"
          >
            <Car className="h-10 w-10 text-amber-400 drop-shadow-[0_6px_16px_rgba(255,193,7,0.35)]" />
          </motion.div>
        </div>

        {/* indeterminate progress bar */}
        <div className="mx-auto h-1.5 w-72 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-amber-400 to-amber-200"
            animate={{ x: ['-33%', '133%'] }}
            transition={{ repeat: Infinity, duration: 1.15, ease: 'linear' }}
          />
        </div>

        <p className="mt-4 text-center text-sm font-medium text-white/90">{text}</p>
      </div>
    </div>
  );
}
