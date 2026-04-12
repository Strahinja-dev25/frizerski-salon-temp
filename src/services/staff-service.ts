// ============================================================================
// Staff Service — Data Access sloj za radnike
// ============================================================================
// Sva Prisma logika vezana za User i TimeOff modele.
// Poziva se isključivo iz Server Actions (lib/actions/).
// ============================================================================

import { db } from "@/lib/prisma";
import type { Role } from "@prisma/client";

// ---------------------------------------------------------------------------
// User (Radnici/Admini)
// ---------------------------------------------------------------------------

/** Dohvata korisnika po Clerk ID-u */
export async function getUserByClerkId(clerkUserId: string) {
  return db.user.findUnique({
    where: { clerkUserId },
  });
}

/** Dohvata korisnika po internom ID-u */
export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
  });
}

/** Dohvata sve radnike (za booking stranicu — izbor frizera) */
export async function getAllStaff() {
  return db.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
}

/** Kreira novog korisnika (poziva se pri prvom login-u preko Clerk-a) */
export async function createUser(data: {
  clerkUserId: string;
  name: string;
  email: string;
  role?: Role;
}) {
  return db.user.create({
    data: {
      clerkUserId: data.clerkUserId,
      name: data.name,
      email: data.email,
      role: data.role ?? "STAFF",
    },
  });
}

/** Ažurira ulogu korisnika (samo Admin može) */
export async function updateUserRole(id: string, role: Role) {
  return db.user.update({
    where: { id },
    data: { role },
  });
}

/** Briše korisnika i sve njegove termine (cascade) */
export async function deleteUser(id: string) {
  return db.user.delete({
    where: { id },
  });
}

// ---------------------------------------------------------------------------
// TimeOff (Slobodni dani)
// ---------------------------------------------------------------------------

/** Dohvata slobodne dane za radnika */
export async function getTimeOffsByUserId(userId: string) {
  return db.timeOff.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
}

/** Dohvata sve slobodne dane (za admin pregled) */
export async function getAllTimeOffs() {
  return db.timeOff.findMany({
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });
}

/** Kreira slobodan dan za radnika */
export async function createTimeOff(data: {
  userId: string;
  date: Date;
  reason: string;
}) {
  return db.timeOff.create({
    data: {
      userId: data.userId,
      date: data.date,
      reason: data.reason,
    },
  });
}

/** Briše slobodan dan */
export async function deleteTimeOff(id: string) {
  return db.timeOff.delete({
    where: { id },
  });
}

/** Proverava da li radnik ima slobodan dan na zadati datum */
export async function hasTimeOffOnDate(userId: string, date: Date): Promise<boolean> {
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const timeOff = await db.timeOff.findFirst({
    where: {
      userId,
      date: { gte: startOfDay, lt: endOfDay },
    },
  });

  return !!timeOff;
}
