/**
 * Very simple fare logic for MVP.
 * You will replace these with proper slabs or Distance Matrix later.
 */
export function computeFare(payload) {
  const type = payload.tripType;

  if (type === "airport_city") {
    // Flat rate for airport ↔ city
    return { fare: 800, currency: process.env.DEFAULT_CURRENCY || "INR" };
  }

  if (type === "outstation") {
    const km = Number(payload.approxKm || 0);
    const perKm = 14; // INR/km
    const minFare = 2000;
    return {
      fare: Math.max(minFare, Math.round(km * perKm)),
      currency: process.env.DEFAULT_CURRENCY || "INR",
    };
  }

  if (type === "rental") {
    const hours = Number(payload.hours || 0);
    const perHour = 300; // INR/hour
    const minFare = 1200;
    return {
      fare: Math.max(minFare, Math.round(hours * perHour)),
      currency: process.env.DEFAULT_CURRENCY || "INR",
    };
  }

  return { fare: 0, currency: process.env.DEFAULT_CURRENCY || "INR" };
}
