// ============================================================================
// Prisma Client Singleton (Prisma 7 with Driver Adapter)
// ============================================================================
// Prisma 7 zahteva Driver Adapter (pg) za direktne PostgreSQL konekcije.
// Singleton sprečava kreiranje više Pool konekcija u development modu.
// ============================================================================

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL nije definisan u .env fajlu.");
}

// Inicijalizacija Pool-a i Adaptera
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

/** Singleton Prisma instanca — koristi se u svim servisima */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
