// ============================================================================
// TypeScript Interfejsi
// ============================================================================
// Centralizovani tipovi koji se koriste u celom projektu.
// Prisma generiše svoje tipove automatski — ovde definišemo dodatne
// interfejse za API odgovore, frontend state, itd.
// ============================================================================

import type {
  User,
  Service,
  Appointment,
  TimeOff,
  SalonSettings,
  WorkSchedule,
  Role,
  AppointmentStatus,
  DayOfWeek,
} from "@prisma/client";

// Re-export Prisma tipova za lakši import
export type { User, Service, Appointment, TimeOff, SalonSettings, WorkSchedule };
export type { Role, AppointmentStatus, DayOfWeek };

// ---------------------------------------------------------------------------
// Appointment sa relacijama (za dashboard prikaz)
// ---------------------------------------------------------------------------

/** Appointment sa uključenim User i Service podacima */
export interface AppointmentWithRelations extends Appointment {
  user: Pick<User, "id" | "name" | "email">;
  service: Pick<Service, "id" | "name" | "price" | "durationMinutes">;
}

// ---------------------------------------------------------------------------
// API Response tipovi
// ---------------------------------------------------------------------------

/** Standardni API odgovor */
export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

/** Paginiran API odgovor */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// Dashboard statistike
// ---------------------------------------------------------------------------

/** Statistike za dashboard kartice */
export interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  monthRevenue: number;
}

// ---------------------------------------------------------------------------
// Booking (zakazivanje) tipovi
// ---------------------------------------------------------------------------

/** Dostupni termini za prikaz klijentu */
export interface AvailableSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

/** Podaci koje klijent šalje pri zakazivanju */
export interface BookingFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceId: string;
  userId: string;
  startTime: string; // ISO string
}

// ---------------------------------------------------------------------------
// Status stranica tipovi
// ---------------------------------------------------------------------------

/** Rezultat pretrage statusa za klijenta */
export interface ClientStatusResult {
  appointments: AppointmentWithRelations[];
  totalFound: number;
}

// ---------------------------------------------------------------------------
// WorkSchedule za frontend prikaz (kontakt sekcija)
// ---------------------------------------------------------------------------

/** Radno vreme po danima — za tabelu u kontakt sekciji */
export interface WorkScheduleDisplay {
  dayOfWeek: DayOfWeek;
  dayName: string; // Srpski naziv dana (npr. "Ponedeljak")
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

/** Mapiranje DayOfWeek enuma na srpske nazive */
export const DAY_NAMES: Record<DayOfWeek, string> = {
  MONDAY: "Ponedeljak",
  TUESDAY: "Utorak",
  WEDNESDAY: "Sreda",
  THURSDAY: "Četvrtak",
  FRIDAY: "Petak",
  SATURDAY: "Subota",
  SUNDAY: "Nedelja",
};
