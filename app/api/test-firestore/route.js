// app/api/test-firestore/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    // Write a dummy booking into Firestore
    const ref = await db.collection("testBookings").add({
      customer: "Test User",
      pickup: "Chennai Airport",
      drop: "Chennai City",
      createdAt: new Date(),
    });

    return NextResponse.json({
      ok: true,
      message: "✅ Firestore test booking created!",
      id: ref.id,
    });
  } catch (err) {
    console.error("Firestore test error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
