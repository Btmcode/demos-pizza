import { NextResponse } from "next/server";

/**
 * GET /api/auth/error → 404
 * Error sayfasını sızdırmaz.
 */
export async function GET() {
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}
