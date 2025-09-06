export async function getRouteSummary(start, end) {
  const key = process.env.LOCATIONIQ_API_KEY;
  if (!key) throw new Error("⚠️ LOCATIONIQ_API_KEY not set");

  const url = new URL(`https://us1.locationiq.com/v1/directions/driving/${start.lng},${start.lat};${end.lng},${end.lat}`);
  url.searchParams.set("key", key);
  url.searchParams.set("overview", "false");

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LocationIQ error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const route = data?.routes?.[0];
  return {
    distanceKm: (route?.distance ?? 0) / 1000,
    durationMin: (route?.duration ?? 0) / 60,
  };
}
