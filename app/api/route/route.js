// app/api/route/route.js
import { NextResponse } from "next/server";
import { getRoute } from "@/lib/geo";

export async function POST(req) {
  try {
    const { pickup, drop } = await req.json();
    if (!pickup?.lat || !pickup?.lon || !drop?.lat || !drop?.lon) {
      return NextResponse.json({ error: "pickup/drop lat/lon required" }, { status: 400 });
    }
    const route = await getRoute({ from: pickup, to: drop, profile: "driving" });
    return NextResponse.json({ ok: true, ...route });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
