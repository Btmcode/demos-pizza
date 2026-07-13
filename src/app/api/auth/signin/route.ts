import { NextResponse } from "next/server";

/**
 * GET /api/auth/signin → 404
 * NextAuth'un default signin sayfasını gizler.
 * POST /api/auth/callback/credentials ile login olur.
 */
export async function GET() {
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}
