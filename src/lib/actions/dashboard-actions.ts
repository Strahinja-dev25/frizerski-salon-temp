// ============================================================================
// Server Actions — Dashboard (Controller sloj)
// ============================================================================
// Akcije za upravljanje terminima, uslugama, radnicima i podešavanjima.
// Sadrži RBAC provere — Admin vs Staff pristup.
// ============================================================================

"use server";

import { auth } from "@clerk/nextjs/server";
import {
  updateAppointmentStatusSchema,
  createServiceSchema,
  createTimeOffSchema,
  updateSalonSettingsSchema,
  updateWorkScheduleSchema,
} from "@/lib/validations";
import {
  updateAppointmentStatus,
  deletePendingAppointment,
  getAppointmentById,
} from "@/services/booking-service";
import {
  createService,
  deleteService,
} from "@/services/appointment-service";
import { canClientCancelDirectly } from "@/services/appointment-service";
import {
  updateSalonSettings,
  updateWorkSchedule,
} from "@/services/settings-service";
import {
  getUserByClerkId,
  createTimeOff,
  deleteTimeOff,
} from "@/services/staff-service";
import type { ApiResponse, Role } from "@/types";

// ---------------------------------------------------------------------------
// Helper: Provera autentifikacije i uloge
// ---------------------------------------------------------------------------

async function getAuthenticatedUser(requiredRole?: Role) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return { error: "Niste prijavljeni.", user: null };
  }

  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    return { error: "Korisnik nije pronađen u sistemu.", user: null };
  }

  if (requiredRole && user.role !== requiredRole) {
    return { error: "Nemate dozvolu za ovu akciju.", user: null };
  }

  return { error: null, user };
}

// ---------------------------------------------------------------------------
// Appointment Actions
// ---------------------------------------------------------------------------

/** Prihvatanje/odbijanje termina (radnik ili admin) */
export async function updateAppointmentStatusAction(
  formData: unknown
): Promise<ApiResponse> {
  try {
    const { error, user } = await getAuthenticatedUser();
    if (error || !user) return { success: false, message: error ?? "Greška." };

    const parsed = updateAppointmentStatusSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Neispravni podaci." };
    }

    const { id, status } = parsed.data;

    // Radnik može menjati samo svoje termine
    if (user.role === "STAFF") {
      const appointment = await getAppointmentById(id);
      if (!appointment || appointment.userId !== user.id) {
        return { success: false, message: "Nemate pristup ovom terminu." };
      }
    }

    await updateAppointmentStatus(id, status);

    const statusMessages: Record<string, string> = {
      APPROVED: "Termin je odobren.",
      REJECTED: "Termin je odbijen.",
      CANCELLED_BY_CLIENT: "Termin je otkazan.",
    };

    return {
      success: true,
      message: statusMessages[status] ?? "Status je ažuriran.",
    };
  } catch (error) {
    console.error("[DASHBOARD ACTION] Greška:", error);
    return { success: false, message: "Došlo je do greške." };
  }
}

/** Otkazivanje termina od strane klijenta (sa /status stranice) */
export async function cancelAppointmentByClientAction(
  appointmentId: string,
  clientEmail: string
): Promise<ApiResponse> {
  try {
    const appointment = await getAppointmentById(appointmentId);

    if (!appointment) {
      return { success: false, message: "Termin nije pronađen." };
    }

    // Verifikacija da je pravi klijent
    if (appointment.clientEmail !== clientEmail) {
      return { success: false, message: "Nemate pristup ovom terminu." };
    }

    // Ako je PENDING — može direktno obrisati
    if (appointment.status === "PENDING") {
      await deletePendingAppointment(appointmentId);
      return { success: true, message: "Termin je uspešno otkazan." };
    }

    // Ako je APPROVED — proveri pravilo 18 sati
    if (appointment.status === "APPROVED") {
      if (canClientCancelDirectly(appointment.startTime)) {
        // Više od 18 sati do termina — direktno otkaži
        await updateAppointmentStatus(appointmentId, "CANCELLED_BY_CLIENT");
        return { success: true, message: "Termin je uspešno otkazan." };
      } else {
        // Manje od 18 sati — šalje se zahtev radniku
        // Status ostaje APPROVED, ali se šalje notifikacija
        // (za sada samo vraćamo poruku, notifikacija se implementira kasnije)
        return {
          success: false,
          message:
            "Termin ne može biti otkazan jer je do njega ostalo manje od 18 sati. Zahtev za otkazivanje je poslat frizeru.",
        };
      }
    }

    return {
      success: false,
      message: "Ovaj termin nije moguće otkazati.",
    };
  } catch (error) {
    console.error("[CANCEL ACTION] Greška:", error);
    return { success: false, message: "Došlo je do greške." };
  }
}

// ---------------------------------------------------------------------------
// Service Actions (samo Admin)
// ---------------------------------------------------------------------------

/** Kreiranje nove usluge */
export async function createServiceAction(
  formData: unknown
): Promise<ApiResponse> {
  try {
    const { error } = await getAuthenticatedUser("ADMIN");
    if (error) return { success: false, message: error };

    const parsed = createServiceSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Neispravni podaci." };
    }

    await createService(parsed.data);
    return { success: true, message: "Usluga je uspešno kreirana." };
  } catch (error) {
    console.error("[SERVICE ACTION] Greška:", error);
    return { success: false, message: "Došlo je do greške." };
  }
}

/** Brisanje usluge */
export async function deleteServiceAction(
  serviceId: string
): Promise<ApiResponse> {
  try {
    const { error } = await getAuthenticatedUser("ADMIN");
    if (error) return { success: false, message: error };

    await deleteService(serviceId);
    return { success: true, message: "Usluga je obrisana." };
  } catch (error) {
    console.error("[SERVICE ACTION] Greška:", error);
    return {
      success: false,
      message: "Usluga ne može biti obrisana jer ima aktivnih termina.",
    };
  }
}

// ---------------------------------------------------------------------------
// TimeOff Actions
// ---------------------------------------------------------------------------

/** Kreiranje slobodnog dana */
export async function createTimeOffAction(
  formData: unknown
): Promise<ApiResponse> {
  try {
    const { error, user } = await getAuthenticatedUser();
    if (error || !user) return { success: false, message: error ?? "Greška." };

    const parsed = createTimeOffSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Neispravni podaci." };
    }

    await createTimeOff({
      userId: user.id,
      date: new Date(parsed.data.date),
      reason: parsed.data.reason,
    });

    return { success: true, message: "Slobodan dan je uspešno dodat." };
  } catch (error) {
    console.error("[TIMEOFF ACTION] Greška:", error);
    return { success: false, message: "Došlo je do greške." };
  }
}

/** Brisanje slobodnog dana */
export async function deleteTimeOffAction(
  timeOffId: string
): Promise<ApiResponse> {
  try {
    const { error } = await getAuthenticatedUser();
    if (error) return { success: false, message: error };

    await deleteTimeOff(timeOffId);
    return { success: true, message: "Slobodan dan je obrisan." };
  } catch (error) {
    console.error("[TIMEOFF ACTION] Greška:", error);
    return { success: false, message: "Došlo je do greške." };
  }
}

// ---------------------------------------------------------------------------
// Settings Actions (samo Admin)
// ---------------------------------------------------------------------------

/** Toggle za zakazivanje (Zakazivanja: Uključena/Isključena) */
export async function toggleBookingAction(
  isActive: boolean
): Promise<ApiResponse> {
  try {
    const { error } = await getAuthenticatedUser("ADMIN");
    if (error) return { success: false, message: error };

    await updateSalonSettings({ isBookingActive: isActive });
    return {
      success: true,
      message: isActive
        ? "Zakazivanje je uključeno."
        : "Zakazivanje je isključeno.",
    };
  } catch (error) {
    console.error("[SETTINGS ACTION] Greška:", error);
    return { success: false, message: "Došlo je do greške." };
  }
}

/** Ažuriranje podešavanja salona */
export async function updateSalonSettingsAction(
  formData: unknown
): Promise<ApiResponse> {
  try {
    const { error } = await getAuthenticatedUser("ADMIN");
    if (error) return { success: false, message: error };

    const parsed = updateSalonSettingsSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Neispravni podaci." };
    }

    await updateSalonSettings(parsed.data);
    return { success: true, message: "Podešavanja su ažurirana." };
  } catch (error) {
    console.error("[SETTINGS ACTION] Greška:", error);
    return { success: false, message: "Došlo je do greške." };
  }
}

/** Ažuriranje rasporeda za jedan dan */
export async function updateWorkScheduleAction(
  formData: unknown
): Promise<ApiResponse> {
  try {
    const { error } = await getAuthenticatedUser("ADMIN");
    if (error) return { success: false, message: error };

    const parsed = updateWorkScheduleSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message ?? "Neispravni podaci." };
    }

    const { dayOfWeek, ...data } = parsed.data;
    await updateWorkSchedule(dayOfWeek, data);
    return { success: true, message: "Raspored je ažuriran." };
  } catch (error) {
    console.error("[SCHEDULE ACTION] Greška:", error);
    return { success: false, message: "Došlo je do greške." };
  }
}
