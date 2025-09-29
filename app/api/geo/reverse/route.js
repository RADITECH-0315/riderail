// app/api/geo/reverse/route.js
import { NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/geo";

export async function POST(req) {
  try {
    const { lat, lon } = await req.json();
    if (typeof lat !== "number" || typeof lon !== "number") {
      return NextResponse.json({ ok: false, error: "lat/lon required" }, { status: 400 });
    }
    const data = await reverseGeocode({ lat, lon });
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
