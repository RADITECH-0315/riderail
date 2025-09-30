export const dynamic = "force-dynamic"; // ✅ Prevents static rendering
export const runtime = "nodejs";

export async function GET(req) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() || "";
    if (!q) return Response.json({ suggestions: [] });

    const url = new URL("https://api.locationiq.com/v1/autocomplete");
    url.searchParams.set("key", process.env.NEXT_PUBLIC_LOCATIONIQ_KEY);
    url.searchParams.set("q", q);
    url.searchParams.set("limit", "6");
    url.searchParams.set("countrycodes", "in");
    url.searchParams.set("normalizecity", "1");
    url.searchParams.set("accept-language", "en");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return Response.json({ suggestions: [], error: "Location service error" }, { status: 500 });
    }

    const data = await res.json();
    const suggestions = (data || []).map((d) => ({
      label: d.display_place || d.address?.name || d.display_name || `${d.lat}, ${d.lon}`,
      address: d.display_name || "",
      lat: parseFloat(d.lat),
      lon: parseFloat(d.lon),
    }));

    return Response.json({ suggestions });
  } catch (err) {
    console.error("[/api/places] error:", err);
    return Response.json({ suggestions: [], error: err.message || "Internal error" }, { status: 500 });
  }
}
