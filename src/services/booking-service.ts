// ============================================================================
// Booking Service — Data Access sloj za zakazivanje termina
// ============================================================================
// Sva Prisma logika vezana za Appointment model.
// Poziva se isključivo iz Server Actions (lib/actions/).
// ============================================================================

import { db } from "@/lib/prisma";
import type { AppointmentStatus } from "@prisma/client";
import type { AppointmentWithRelations, DashboardStats } from "@/types";

// ---------------------------------------------------------------------------
// Kreiranje termina
// ---------------------------------------------------------------------------

interface CreateAppointmentData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  serviceId: string;
}

/** Kreira novi termin sa statusom PENDING */
export async function createAppointment(data: CreateAppointmentData) {
  return db.appointment.create({
    data: {
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      startTime: data.startTime,
      endTime: data.endTime,
      userId: data.userId,
      serviceId: data.serviceId,
      status: "PENDING",
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, price: true, durationMinutes: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// Čitanje termina
// ---------------------------------------------------------------------------

/** Dohvata maksimalno 200 poslednjih termina za radnika (za dashboard) */
export async function getAppointmentsByUserId(
  userId: string,
  statusFilter?: AppointmentStatus[]
): Promise<AppointmentWithRelations[]> {
  return db.appointment.findMany({
    where: {
      userId,
      ...(statusFilter ? { status: { in: statusFilter } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, price: true, durationMinutes: true } },
    },
    orderBy: { startTime: "desc" },
    take: 200,
  });
}

/** Dohvata maksimalno 200 poslednjih termina (za admin dashboard) */
export async function getAllAppointments(
  statusFilter?: AppointmentStatus[]
): Promise<AppointmentWithRelations[]> {
  return db.appointment.findMany({
    where: statusFilter ? { status: { in: statusFilter } } : {},
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, price: true, durationMinutes: true } },
    },
    orderBy: { startTime: "desc" },
    take: 200,
  });
}

/** Dohvata termine po email-u klijenta (za /status stranicu, poslednjih 20 dana) */
export async function getAppointmentsByClientEmail(
  email: string
): Promise<AppointmentWithRelations[]> {
  const twentyDaysAgo = new Date();
  twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

  return db.appointment.findMany({
    where: {
      clientEmail: email,
      createdAt: { gte: twentyDaysAgo },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, price: true, durationMinutes: true } },
    },
    orderBy: { startTime: "desc" },
  });
}

/** Dohvata jedan termin po ID-u */
export async function getAppointmentById(id: string) {
  return db.appointment.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, price: true, durationMinutes: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// Ažuriranje statusa
// ---------------------------------------------------------------------------

/** Menja status termina (approve/reject/cancel) */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  return db.appointment.update({
    where: { id },
    data: { status },
  });
}

// ---------------------------------------------------------------------------
// Brisanje (za klijent cancel iz pending stanja)
// ---------------------------------------------------------------------------

/** Briše termin koji je još u PENDING statusu */
export async function deletePendingAppointment(id: string) {
  return db.appointment.delete({
    where: { id },
  });
}

// ---------------------------------------------------------------------------
// Provera kolizija termina
// ---------------------------------------------------------------------------

/** Proverava da li postoji termin koji se preklapa sa zadatim vremenskim opsegom */
export async function hasOverlappingAppointment(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeId?: string
): Promise<boolean> {
  const overlapping = await db.appointment.findFirst({
    where: {
      userId,
      status: { in: ["PENDING", "APPROVED"] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [
        {
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      ],
    },
  });

  return !!overlapping;
}

// ---------------------------------------------------------------------------
// Dashboard statistike
// ---------------------------------------------------------------------------

/** Izračunava statistike za dashboard (dnevni i mesečni prihod) */
export async function getDashboardStats(userId?: string): Promise<DashboardStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const userFilter = userId ? { userId } : {};

  // Današnji termini (APPROVED ili COMPLETED)
  const todayAppointments = await db.appointment.count({
    where: {
      ...userFilter,
      status: { in: ["APPROVED", "COMPLETED"] },
      startTime: { gte: startOfDay, lt: endOfDay },
    },
  });

  // Današnji prihod (samo COMPLETED)
  const todayAppts = await db.appointment.findMany({
    where: {
      ...userFilter,
      status: "COMPLETED",
      startTime: { gte: startOfDay, lt: endOfDay },
    },
    include: { service: { select: { price: true } } },
  });
  const todayRevenue = todayAppts.reduce((sum, a) => sum + a.service.price, 0);

  // Mesečni prihod (samo COMPLETED)
  const monthAppts = await db.appointment.findMany({
    where: {
      ...userFilter,
      status: "COMPLETED",
      startTime: { gte: startOfMonth, lt: endOfMonth },
    },
    include: { service: { select: { price: true } } },
  });
  const monthRevenue = monthAppts.reduce((sum, a) => sum + a.service.price, 0);

  return {
    todayAppointments,
    todayRevenue,
    monthRevenue,
  };
}

/** Dohvata sve ODOBRENE termine za danas — koristi cron za slanje podsetnika */
export async function getTodayApprovedAppointments() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  return db.appointment.findMany({
    where: {
      status: "APPROVED",
      startTime: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      service: { select: { id: true, name: true, price: true, durationMinutes: true } },
    },
    orderBy: { startTime: "asc" },
  });
}
