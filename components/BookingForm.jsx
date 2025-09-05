'use client';

import { useState, useRef } from 'react';
import { MapPin, Calendar, Clock, Phone, User, Navigation, Car, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initial = {
  tripType: 'airport_to_city',
  pickup: '',
  drop: '',
  date: '',
  time: '',
  name: '',
  phone: '',
  approxKm: '',
  hours: ''
};

export default function BookingForm() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function validateForm() {
    if (!form.pickup || !form.drop || !form.date || !form.time || !form.name || !form.phone) {
      return "All fields are required.";
    }
    if (!/^\+91\d{10}$|^\d{10}$/.test(form.phone)) {
      return "Enter a valid phone number (10 digits or +91XXXXXXXXXX).";
    }
    const today = new Date();
    const tripDate = new Date(`${form.date}T${form.time}`);
    if (tripDate < today) {
      return "Trip date & time must be in the future.";
    }
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(null), 5000);
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate backend
      const data = { bookingId: "TEMP12345", fareINR: 550 };

      setSuccess(data);
      setForm(initial);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError("Booking failed. Try again!");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* 🚘 Loader */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur"
          >
            <motion.div
              initial={{ x: -150 }}
              animate={{ x: 150 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="text-blue-500"
            >
              <Car className="h-16 w-16 drop-shadow-lg" />
            </motion.div>
            <p className="mt-4 text-lg font-semibold text-white">Processing your booking…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM */}
      <form
        onSubmit={onSubmit}
        id="book"
        className="card mx-auto -mt-24 max-w-2xl space-y-4 rounded-2xl bg-white/90 p-6 shadow-2xl ring-1 ring-[var(--ring)] backdrop-blur"
      >
        <h2 className="text-center text-2xl font-extrabold text-[var(--ink)]">Book Your Ride</h2>

        {/* Trip type */}
        <SelectField
          label="Trip Type"
          name="tripType"
          value={form.tripType}
          onChange={handle}
          options={[
            { value: 'airport_to_city', label: 'Airport → City' },
            { value: 'city_to_airport', label: 'City → Airport' },
            { value: 'outstation', label: 'Outstation' },
            { value: 'rental', label: 'Rental' },
          ]}
        />

        {/* Pickup & Drop */}
        <AutocompleteInput
          label="Pickup"
          name="pickup"
          value={form.pickup}
          onChange={handle}
          placeholder="e.g., Chennai Airport (MAA)"
          icon={<MapPin className="h-5 w-5 text-[var(--muted)]" />}
        />
        <AutocompleteInput
          label="Drop"
          name="drop"
          value={form.drop}
          onChange={handle}
          placeholder="e.g., T. Nagar, Chennai"
          icon={<Navigation className="h-5 w-5 text-[var(--muted)]" />}
        />

        {/* Date/Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Date" type="date" name="date" value={form.date} onChange={handle} required icon={<Calendar />} />
          <InputField label="Time" type="time" name="time" value={form.time} onChange={handle} required icon={<Clock />} />
        </div>

        {/* Name/Phone */}
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Name" name="name" value={form.name} onChange={handle} required icon={<User />} />
          <InputField label="Phone (WhatsApp)" name="phone" value={form.phone} onChange={handle} required icon={<Phone />} />
        </div>

        {/* Conditional */}
        {form.tripType === 'outstation' && (
          <InputField label="Approx Distance (km)" type="number" name="approxKm" value={form.approxKm} onChange={handle} />
        )}
        {form.tripType === 'rental' && (
          <InputField label="Hours" type="number" name="hours" value={form.hours} onChange={handle} />
        )}

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Booking…' : 'Book Now'}
        </button>
      </form>

      {/* ✅ Success Popup */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur"
          >
            <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-xl ring-1 ring-black/10">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-3 flex justify-center gap-3"
              >
                <Car className="h-10 w-10 text-blue-500" />
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h3>
              <p className="text-gray-600">Ref: {success.bookingId}</p>
              <p className="text-green-700 font-semibold">Fare: ₹{success.fareINR}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ❌ Error Popup */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-white shadow-lg"
          >
            <XCircle className="h-5 w-5 text-white" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* 🔧 Autocomplete Input (unchanged logic) */
function AutocompleteInput({ label, name, value, onChange, placeholder, icon }) {
  const [suggestions, setSuggestions] = useState([]);
  const cache = useRef({});
  const debounceRef = useRef(null);

  async function fetchSuggestions(query) {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    if (cache.current[query]) {
      setSuggestions(cache.current[query]);
      return;
    }

    let tag = '';
    const q = query.toLowerCase();
    if (q.includes('hotel')) tag = 'hotel';
    else if (q.includes('temple')) tag = 'temple';
    else if (q.includes('restaurant')) tag = 'restaurant';
    else if (q.includes('airport')) tag = 'airport';
    else if (q.includes('station')) tag = 'train_station';

    try {
      const url = `https://us1.locationiq.com/v1/autocomplete?key=${
        process.env.NEXT_PUBLIC_LOCATIONIQ_KEY
      }&q=${encodeURIComponent(query)}&limit=10&format=json&countrycodes=in&viewbox=76.95,8.08,80.35,13.52&bounded=1${
        tag ? `&tag=${tag}` : ''
      }`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      let data = await res.json();

      data = data.filter((s) => s.address && (s.address.state === 'Tamil Nadu' || s.display_name.toLowerCase().includes('tamil nadu')));

      const boosted = [
        'Chennai International Airport (MAA)',
        'ITC Grand Chola, Chennai',
        'Hilton Chennai',
        'The Leela Palace, Chennai',
        'Taj Coromandel, Chennai',
        'Park Hyatt, Chennai',
        'Marina Beach, Chennai',
        'Kapaleeshwarar Temple, Chennai',
        'Mahabalipuram, Tamil Nadu',
      ].map((h, idx) => ({
        place_id: `boosted-${idx}`,
        display_name: h,
        address: { state: 'Tamil Nadu' },
      }));

      if (q.includes('chennai') || q.includes('hotel') || q.includes('airport') || q.includes('beach') || q.includes('temple')) {
        data = [...boosted, ...data];
      }

      cache.current[query] = data;
      setSuggestions(data);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setSuggestions([]);
    }
  }

  function handleChange(e) {
    onChange(e);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(e.target.value);
    }, 300);
  }

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-semibold text-[var(--ink)]">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-2.5">{icon}</span>
        <input
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border bg-white shadow-lg">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => {
                onChange({ target: { name, value: s.display_name } });
                setSuggestions([]);
              }}
              className="cursor-pointer px-3 py-2 hover:bg-yellow-100"
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* 🔧 Input Field */
function InputField({ label, name, value, onChange, type = 'text', placeholder, icon, required }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-[var(--ink)]">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5 text-gray-500">{icon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          className={`w-full rounded-xl border border-slate-300 bg-white py-2 ${icon ? 'pl-10' : 'px-3'} pr-3 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]`}
        />
      </div>
    </div>
  );
}

/* 🔧 Select Field */
function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-[var(--ink)]">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
