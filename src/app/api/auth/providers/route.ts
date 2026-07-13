import { NextResponse } from "next/server";

/**
 * GET /api/auth/providers → 404
 * Provider listesini sızdırmaz.
 */
export async function GET() {
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}
