// ============================================================================
// Prisma Client Singleton
// ============================================================================
// Sprečava kreiranje više instanci PrismaClient-a u development modu
// jer Next.js hot-reload kreira nove module pri svakoj promeni.
// ============================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Singleton Prisma instanca — koristi se u svim servisima */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
