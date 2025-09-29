import { connectDB } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const hasUri = !!process.env.MONGODB_URI;
    const preview = process.env.MONGODB_URI
      ? process.env.MONGODB_URI.slice(0, 60) + "..."
      : "not set";

    // Try to connect
    await connectDB();

    return Response.json({
      ok: true,
      envLoaded: hasUri,
      uriPreview: preview,
      db: "✅ Connected to MongoDB",
    });
  } catch (err) {
    return Response.json({
      ok: false,
      error: err.message,
      uriPreview: process.env.MONGODB_URI?.slice(0, 60) + "...",
    });
  }
}
