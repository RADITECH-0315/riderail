// /lib/fare.js
// Robust road-distance via LocationIQ + a synchronous fare calculator

const toNum = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// ---- ENV with safe defaults
const DEFAULT_CURRENCY     = process.env.DEFAULT_CURRENCY || "INR";
const BASE_FARE            = toNum(process.env.BASE_FARE, 60);
const PER_KM               = toNum(process.env.PER_KM, 15);
const PER_MIN              = toNum(process.env.PER_MIN, 2);
const MIN_FARE             = toNum(process.env.MIN_FARE, 150);
const AIRPORT_SURCHARGE    = toNum(process.env.AIRPORT_SURCHARGE, 50);
const DYNAMIC_MULTIPLIER   = toNum(process.env.DYNAMIC_MULTIPLIER, 1);

// Accept either server or public key var names
const LOCATIONIQ_API_KEY =
  process.env.LOCATIONIQ_API_KEY || process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;

/**
 * Get road distance & duration from LocationIQ Directions API.
 * NOTE: LocationIQ expects [lon, lat] order.
 */
export async function getRoadDistance(pickupLat, pickupLon, dropLat, dropLon) {
  try {
    const hasAll =
      [pickupLat, pickupLon, dropLat, dropLon].every((v) =>
        Number.isFinite(Number(v))
      );
    if (!hasAll) throw new Error("Invalid coordinates");

    // LocationIQ preferred host is regioned (us1). The /api alias also works,
    // but us1 is recommended and often more reliable.
    const url = new URL(
      `https://us1.locationiq.com/v1/directions/driving/${pickupLon},${pickupLat};${dropLon},${dropLat}`
    );
    url.searchParams.set("key", LOCATIONIQ_API_KEY);
    url.searchParams.set("overview", "false");
    url.searchParams.set("alternatives", "false");
    url.searchParams.set("steps", "false");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Directions API failed (${res.status}): ${text.slice(0, 200)}`);
    }
    const data = await res.json();

    // LocationIQ (Mapbox-compatible) returns distance/duration at route level.
    // Fallback to first leg if needed.
    const route = data?.routes?.[0];
    const distance = route?.distance ?? route?.legs?.[0]?.distance;
    const duration = route?.duration ?? route?.legs?.[0]?.duration;

    if (!(Number.isFinite(distance) && Number.isFinite(duration))) {
      throw new Error("Directions API returned no distance/duration");
    }

    return {
      distanceKm: distance / 1000,                // meters → km
      durationMin: Math.round(duration / 60),     // seconds → minutes
    };
  } catch (err) {
    console.error("[getRoadDistance] error:", err);
    // Fail soft so UI can show a friendly error
    return { distanceKm: 0, durationMin: 0 };
  }
}

/**
 * Synchronous fare math (no network).
 * Call this from your API with precomputed distance/duration.
 */
export function computeFare({ tripType, distanceKm, durationMin, vehicleType }) {
  const dKm  = Number(distanceKm)  || 0;
  const dMin = Number(durationMin) || 0;

  // Start with base rates
  let base  = BASE_FARE;
  let perKm = PER_KM;
  let perMin= PER_MIN;

  // Simple vehicle-based scaling (tweak as you like)
  if (vehicleType === "suv") {
    base *= 1.2; perKm *= 1.2; perMin *= 1.2;
  } else if (vehicleType === "premium") {
    base *= 1.5; perKm *= 1.5; perMin *= 1.5;
  }

  let fare = (base + dKm * perKm + dMin * perMin) * DYNAMIC_MULTIPLIER;

  // Airport surcharge for airport legs
  if (String(tripType || "").includes("airport")) {
    fare += AIRPORT_SURCHARGE;
  }

  if (!Number.isFinite(fare)) fare = MIN_FARE;
  fare = Math.max(MIN_FARE, Math.round(fare));

  return { fare, currency: DEFAULT_CURRENCY };
}

/**
 * Convenience wrapper: compute fare directly from coordinates.
 * Not used by your /api/bookings right now, but handy to have.
 */
export async function computeFareWithCoords({
  tripType,
  pickupLat, pickupLon,
  dropLat, dropLon,
  vehicleType,
}) {
  const { distanceKm, durationMin } = await getRoadDistance(
    pickupLat, pickupLon, dropLat, dropLon
  );

  const result = computeFare({ tripType, distanceKm, durationMin, vehicleType });
  return {
    ...result,
    distanceKm: Math.round(distanceKm * 100) / 100,
    durationMin,
  };
}
