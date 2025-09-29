import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body || {};
    if (!email || !password) return NextResponse.json({ error: "Email & password required" }, { status: 400 });

    await connectDB();
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return NextResponse.json({ error: "User already exists" }, { status: 409 });

    const passwordHash = await hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase().trim(), phone: (phone || "").trim(), passwordHash });

    return NextResponse.json({ ok: true, id: user._id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
