// app/api/bookings/[id]/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

// === PATCH: Update booking status ===
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { ok: false, error: "Missing status" },
        { status: 400 }
      );
    }

    await db.collection("bookings").doc(id).update({
      status,
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, message: "Booking updated!" });
  } catch (e) {
    console.error("❌ Firestore PATCH error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
