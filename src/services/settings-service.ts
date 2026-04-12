// ============================================================================
// Settings Service — Data Access sloj za podešavanja salona
// ============================================================================
// Sva Prisma logika vezana za SalonSettings i WorkSchedule modele.
// Poziva se isključivo iz Server Actions (lib/actions/).
// ============================================================================

import { db } from "@/lib/prisma";
import type { DayOfWeek } from "@prisma/client";
import type { WorkScheduleDisplay } from "@/types";
import { DAY_NAMES } from "@/types";

// ---------------------------------------------------------------------------
// SalonSettings
// ---------------------------------------------------------------------------

/** Dohvata globalna podešavanja salona */
export async function getSalonSettings() {
  return db.salonSettings.findUnique({
    where: { id: "global" },
  });
}

/** Ažurira globalna podešavanja (isBookingActive, radno vreme) */
export async function updateSalonSettings(data: {
  isBookingActive?: boolean;
  openingTime?: string;
  closingTime?: string;
}) {
  return db.salonSettings.update({
    where: { id: "global" },
    data,
  });
}

/** Proverava da li je zakazivanje aktivno */
export async function isBookingActive(): Promise<boolean> {
  const settings = await getSalonSettings();
  return settings?.isBookingActive ?? false;
}

// ---------------------------------------------------------------------------
// WorkSchedule (Radno vreme po danima)
// ---------------------------------------------------------------------------

/** Dohvata raspored za sve dane u nedelji */
export async function getAllWorkSchedules(): Promise<WorkScheduleDisplay[]> {
  const schedules = await db.workSchedule.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  // Sortiranje po pravilnom redosledu dana (Prisma sortira alfabetski)
  const dayOrder: DayOfWeek[] = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
    "FRIDAY", "SATURDAY", "SUNDAY",
  ];

  return dayOrder.map((day) => {
    const schedule = schedules.find((s) => s.dayOfWeek === day);
    return {
      dayOfWeek: day,
      dayName: DAY_NAMES[day],
      isOpen: schedule?.isOpen ?? false,
      openingTime: schedule?.openingTime ?? "00:00",
      closingTime: schedule?.closingTime ?? "00:00",
    };
  });
}

/** Dohvata raspored za jedan dan */
export async function getWorkScheduleByDay(dayOfWeek: DayOfWeek) {
  return db.workSchedule.findUnique({
    where: { dayOfWeek },
  });
}

/** Ažurira raspored za jedan dan */
export async function updateWorkSchedule(
  dayOfWeek: DayOfWeek,
  data: {
    isOpen: boolean;
    openingTime: string;
    closingTime: string;
  }
) {
  return db.workSchedule.update({
    where: { dayOfWeek },
    data,
  });
}
