"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function BookingForm() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tripType, setTripType] = useState("airport_city");

  const [pickupInput, setPickupInput] = useState("");
  const [pickup, setPickup] = useState("");
  const [pickupLat, setPickupLat] = useState(null);
  const [pickupLon, setPickupLon] = useState(null);

  const [dropInput, setDropInput] = useState("");
  const [drop, setDrop] = useState("");
  const [dropLat, setDropLat] = useState(null);
  const [dropLon, setDropLon] = useState(null);

  // ✅ keep local string like "YYYY-MM-DDTHH:mm"
  const [pickupTime, setPickupTime] = useState("");
  const [minDateTime, setMinDateTime] = useState("");
  const [passengers, setPassengers] = useState(1); // ✅ NEW
  const [loading, setLoading] = useState(false);

  const [pSuggestions, setPSuggestions] = useState([]);
  const [dSuggestions, setDSuggestions] = useState([]);

  // debounce helper
  const debounceRef = useRef({});
  function debounced(key, fn, delay = 400) {
    return (...args) => {
      const prev = debounceRef.current[key];
      if (prev) clearTimeout(prev);
      debounceRef.current[key] = setTimeout(() => fn(...args), delay);
    };
  }

  async function searchLiq(q) {
    if (!q?.trim()) return [];
    try {
      const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.suggestions || [];
    } catch {
      return [];
    }
  }

  const runPickupSearch = useMemo(
    () =>
      debounced("pickup", async (val) => {
        if (val.length < 3) return setPSuggestions([]);
        const data = await searchLiq(val);
        setPSuggestions(
          (data || []).map((d) => ({
            label: d.label || d.address || d.display_name,
            lat: Number(d.lat),
            lon: Number(d.lng ?? d.lon),
          }))
        );
      }),
    []
  );

  const runDropSearch = useMemo(
    () =>
      debounced("drop", async (val) => {
        if (val.length < 3) return setDSuggestions([]);
        const data = await searchLiq(val);
        setDSuggestions(
          (data || []).map((d) => ({
            label: d.label || d.address || d.display_name,
            lat: Number(d.lat),
            lon: Number(d.lng ?? d.lon),
          }))
        );
      }),
    []
  );

  function handlePickupInput(e) {
    const val = e.target.value;
    setPickupInput(val);
    setPickup("");
    setPickupLat(null);
    setPickupLon(null);
    runPickupSearch(val);
  }

  function handleDropInput(e) {
    const val = e.target.value;
    setDropInput(val);
    setDrop("");
    setDropLat(null);
    setDropLon(null);
    runDropSearch(val);
  }

  function choosePickup(s) {
    setPickupInput(s.label);
    setPickup(s.label);
    setPickupLat(s.lat);
    setPickupLon(s.lon);
    setPSuggestions([]);
  }
  function chooseDrop(s) {
    setDropInput(s.label);
    setDrop(s.label);
    setDropLat(s.lat);
    setDropLon(s.lon);
    setDSuggestions([]);
  }

  const closeSuggestionsSoon = (which) => {
    setTimeout(() => {
      if (which === "p") setPSuggestions([]);
      else setDSuggestions([]);
    }, 150);
  };

  // Set min datetime = now (local)
  useEffect(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setMinDateTime(local);
  }, []);

  // Prefill when editing
  useEffect(() => {
    if (!bookingId) return;
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        setName(data.name || "");
        setPhone(data.phone || "");
        setTripType(data.tripType || "airport_city");

        setPickupInput(data.pickup || "");
        setPickup(data.pickup || "");
        setPickupLat(data.pickupLat ?? null);
        setPickupLon(data.pickupLon ?? null);

        setDropInput(data.drop || "");
        setDrop(data.drop || "");
        setDropLat(data.dropLat ?? null);
        setDropLon(data.dropLon ?? null);

        setPickupTime(data.pickupTime || "");
        setPassengers(data.passengers ?? 1); // ✅ NEW
      });
  }, [bookingId]);

  async function ensureCoords() {
    let finalPickupLat = pickupLat;
    let finalPickupLon = pickupLon;
    let finalDropLat = dropLat;
    let finalDropLon = dropLon;
    let finalPickupLabel = pickup || pickupInput;
    let finalDropLabel = drop || dropInput;

    if ((!finalPickupLat || !finalPickupLon) && pickupInput) {
      const res = await searchLiq(pickupInput);
      if (res?.length) {
        finalPickupLat = Number(res[0].lat);
        finalPickupLon = Number(res[0].lon);
        if (!finalPickupLabel) finalPickupLabel = res[0].label;
      }
    }
    if ((!finalDropLat || !finalDropLon) && dropInput) {
      const res = await searchLiq(dropInput);
      if (res?.length) {
        finalDropLat = Number(res[0].lat);
        finalDropLon = Number(res[0].lon);
        if (!finalDropLabel) finalDropLabel = res[0].label;
      }
    }

    return {
      finalPickupLat,
      finalPickupLon,
      finalDropLat,
      finalDropLon,
      finalPickupLabel,
      finalDropLabel,
    };
  }

  async function onSubmit(e) {
    e.preventDefault();

    const {
      finalPickupLat,
      finalPickupLon,
      finalDropLat,
      finalDropLon,
      finalPickupLabel,
      finalDropLabel,
    } = await ensureCoords();

    if (!finalPickupLat || !finalPickupLon || !finalDropLat || !finalDropLon) {
      alert("Please select valid pickup & drop locations.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        phone,
        tripType,
        pickup: finalPickupLabel,
        drop: finalDropLabel,
        pickupLat: finalPickupLat,
        pickupLon: finalPickupLon,
        dropLat: finalDropLat,
        dropLon: finalDropLon,
        pickupTime,          // keep local string
        passengers: Number(passengers) || 1, // ✅ include passengers
      };

      let res;
      if (bookingId) {
        res = await fetch(`/api/bookings/${bookingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data?.id) {
        throw new Error(data?.error || "Failed to save booking");
      }
      window.location.href = `/review?id=${data.id}`;
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-8 w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6"
    >
      <h2 className="text-xl font-semibold text-slate-900 text-center">
        🚖 {bookingId ? "Edit Your Booking" : "Book Your Ride"}
      </h2>

      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-input"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          inputMode="tel"
          pattern="[0-9]{10,}"
          className="form-input"
        />
      </div>

      {/* Trip Type + Passengers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
          className="form-select"
        >
          <option value="airport_city">Airport → City</option>
          <option value="city_airport">City → Airport</option>
          <option value="outstation">Outstation</option>
          <option value="rental">Rental</option>
          <option value="local">Local</option>
        </select>

        <input
          type="number"
          min={1}
          max={8}
          step={1}
          value={passengers}
          onChange={(e) => setPassengers(e.target.value)}
          className="form-input"
          placeholder="Passengers"
          aria-label="Passengers"
        />
      </div>

      {/* Pickup */}
      <div className="relative">
        <input
          type="text"
          placeholder="Pickup location"
          value={pickupInput}
          onChange={handlePickupInput}
          onFocus={() => runPickupSearch(pickupInput)}
          onBlur={() => closeSuggestionsSoon("p")}
          required
          className="form-input"
        />
        {pSuggestions.length > 0 && (
          <ul className="suggestion-list">
            {pSuggestions.map((s, i) => (
              <li
                key={`${s.lat}-${s.lon}-${i}`}
                className="suggestion-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choosePickup(s)}
              >
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Drop */}
      <div className="relative">
        <input
          type="text"
          placeholder="Drop location"
          value={dropInput}
          onChange={handleDropInput}
          onFocus={() => runDropSearch(dropInput)}
          onBlur={() => closeSuggestionsSoon("d")}
          required
          className="form-input"
        />
        {dSuggestions.length > 0 && (
          <ul className="suggestion-list">
            {dSuggestions.map((s, i) => (
              <li
                key={`${s.lat}-${s.lon}-${i}`}
                className="suggestion-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => chooseDrop(s)}
              >
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pickup Time */}
      <input
        type="datetime-local"
        value={pickupTime}
        min={minDateTime}
        step="60"
        onChange={(e) => setPickupTime(e.target.value)} // keep local string
        required
        className="form-input"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--brand)] py-3 font-semibold text-slate-900 shadow-md hover:bg-yellow-500 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : bookingId ? "Update Booking" : "Book Now"}
      </button>
    </form>
  );
}
