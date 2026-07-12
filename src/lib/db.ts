import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma client singleton.
 * Vercel serverless'ta hot-reload sırasında connection pool
 * tüketmemek için global'e alınır.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// ============================================================
//  Helper: JSON field parse (SQLite String storage)
// ============================================================

export function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function stringifyField(value: unknown): string {
  return JSON.stringify(value ?? []);
}

// ============================================================
//  Helper: parse menu item ingredients/tags
// ============================================================

export function parseArrayField(value: string | null | undefined): string[] {
  return parseJsonField<string[]>(value, []);
}
