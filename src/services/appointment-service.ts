// ============================================================================
// Appointment Service — Dodatne operacije za termin logiku
// ============================================================================
// Viša logika vezana za termine koja kombinuje booking-service i
// settings-service — dostupni slotovi, pravila otkazivanja itd.
// ============================================================================

import { db } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Service (Usluge) — CRUD operacije
// ---------------------------------------------------------------------------

/** Dohvata sve usluge (za glavnu stranicu i booking) */
export async function getAllServices() {
  return db.service.findMany({
    orderBy: { name: "asc" },
  });
}

/** Dohvata jednu uslugu po ID-u */
export async function getServiceById(id: string) {
  return db.service.findUnique({
    where: { id },
  });
}

/** Kreira novu uslugu (samo Admin) */
export async function createService(data: {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}) {
  return db.service.create({ data });
}

/** Ažurira uslugu (samo Admin) */
export async function updateService(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
  }>
) {
  return db.service.update({
    where: { id },
    data,
  });
}

/** Briše uslugu (samo Admin, Restrict ako ima aktivnih termina) */
export async function deleteService(id: string) {
  return db.service.delete({
    where: { id },
  });
}

// ---------------------------------------------------------------------------
// Pravilo otkazivanja — 18 sati pre termina
// ---------------------------------------------------------------------------

/**
 * Proverava da li klijent može da otkaže termin.
 * Pravilo: termin ne može da se otkaže ako je do njega ostalo manje od 18 sati.
 * @returns true ako može sam da otkaže, false ako mora da pošalje zahtev radniku
 */
export function canClientCancelDirectly(appointmentStartTime: Date): boolean {
  const now = new Date();
  const hoursUntilAppointment =
    (appointmentStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursUntilAppointment > 18;
}
