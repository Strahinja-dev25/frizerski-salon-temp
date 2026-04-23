// ============================================================================
// Zod Validacione Šeme
// ============================================================================
// Sve validacije podataka koji dolaze sa frontenda pre upisa u bazu.
// Koriste se u Server Actions (lib/actions/) sloju.
// ============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Service (Usluge)
// ---------------------------------------------------------------------------

/** Validacija za kreiranje nove usluge */
export const createServiceSchema = z.object({
  name: z
    .string()
    .min(2, "Naziv usluge mora imati najmanje 2 karaktera.")
    .max(100, "Naziv usluge ne sme biti duži od 100 karaktera."),
  description: z
    .string()
    .max(500, "Opis ne sme biti duži od 500 karaktera.")
    .default(""),
  price: z
    .number()
    .int("Cena mora biti ceo broj.")
    .min(0, "Cena ne može biti negativna.")
    .max(100000, "Cena ne sme biti veća od 100.000 RSD."),
  durationMinutes: z
    .number()
    .int("Trajanje mora biti ceo broj.")
    .min(5, "Minimalno trajanje je 5 minuta.")
    .max(480, "Maksimalno trajanje je 480 minuta (8 sati)."),
});

/** Validacija za ažuriranje usluge */
export const updateServiceSchema = createServiceSchema.partial();

// ---------------------------------------------------------------------------
// Appointment (Zakazivanje termina)
// ---------------------------------------------------------------------------

/** Validacija za kreiranje novog termina (klijent zakazuje) */
export const createAppointmentSchema = z.object({
  clientName: z
    .string()
    .min(2, "Ime mora imati najmanje 2 karaktera.")
    .max(100, "Ime ne sme biti duže od 100 karaktera."),
  clientEmail: z
    .string()
    .email("Unesite validnu email adresu."),
  clientPhone: z
    .string()
    .min(6, "Telefon mora imati najmanje 6 cifara.")
    .max(20, "Telefon ne sme biti duži od 20 karaktera.")
    .regex(/^[0-9+\-\s()]+$/, "Telefon može sadržati samo brojeve, +, -, razmake i zagrade."),
  startTime: z
    .string()
    .datetime("Neispravan format datuma i vremena."),
  userId: z
    .string()
    .min(1, "Morate izabrati radnika."),
  serviceId: z
    .string()
    .min(1, "Morate izabrati uslugu."),
});

// ---------------------------------------------------------------------------
// Appointment Status Update (Admin/Radnik menja status)
// ---------------------------------------------------------------------------

/** Validacija za promenu statusa termina */
export const updateAppointmentStatusSchema = z.object({
  id: z.string().min(1, "ID termina je obavezan."),
  status: z.enum(["APPROVED", "REJECTED", "CANCELLED_BY_CLIENT", "COMPLETED", "CANCELLATION_REQUESTED"], {
    error: "Neispravan status termina.",
  }),
});

// ---------------------------------------------------------------------------
// TimeOff (Slobodni dani)
// ---------------------------------------------------------------------------

/** Validacija za kreiranje slobodnog dana */
export const createTimeOffSchema = z.object({
  date: z
    .string()
    .datetime("Neispravan format datuma."),
  reason: z
    .string()
    .min(2, "Razlog mora imati najmanje 2 karaktera.")
    .max(200, "Razlog ne sme biti duži od 200 karaktera."),
});

// ---------------------------------------------------------------------------
// SalonSettings (Podešavanja salona)
// ---------------------------------------------------------------------------

/** Format za radno vreme "HH:mm" */
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Validacija za ažuriranje podešavanja salona */
export const updateSalonSettingsSchema = z.object({
  isBookingActive: z.boolean().optional(),
  openingTime: z
    .string()
    .regex(timeRegex, 'Vreme mora biti u formatu "HH:mm".')
    .optional(),
  closingTime: z
    .string()
    .regex(timeRegex, 'Vreme mora biti u formatu "HH:mm".')
    .optional(),
});

// ---------------------------------------------------------------------------
// WorkSchedule (Raspored po danima)
// ---------------------------------------------------------------------------

/** Validacija za ažuriranje rasporeda jednog dana */
export const updateWorkScheduleSchema = z.object({
  dayOfWeek: z.enum([
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
    "FRIDAY", "SATURDAY", "SUNDAY",
  ]),
  isOpen: z.boolean(),
  openingTime: z
    .string()
    .regex(timeRegex, 'Vreme mora biti u formatu "HH:mm".'),
  closingTime: z
    .string()
    .regex(timeRegex, 'Vreme mora biti u formatu "HH:mm".'),
});

// ---------------------------------------------------------------------------
// Status pretraga (klijent pretražuje po emailu)
// ---------------------------------------------------------------------------

/** Validacija za pretragu statusa termina */
export const statusSearchSchema = z.object({
  email: z
    .string()
    .email("Unesite validnu email adresu."),
});
