// ============================================================================
// Server Actions — Booking (Controller sloj)
// ============================================================================
// Validacija sa Zod-om + pozivanje servisa.
// Ove akcije se pozivaju iz klijentskih komponenti.
// ============================================================================

"use server";

import { createAppointmentSchema } from "@/lib/validations";
import {
  createAppointment,
  hasOverlappingAppointment,
} from "@/services/booking-service";
import { getServiceById } from "@/services/appointment-service";
import { isBookingActive } from "@/services/settings-service";
import { hasTimeOffOnDate } from "@/services/staff-service";
import type { ApiResponse } from "@/types";

/** Server Action: Zakazivanje novog termina */
export async function bookAppointmentAction(
  formData: unknown
): Promise<ApiResponse> {
  try {
    // 1. Provera da li je zakazivanje aktivno
    const bookingActive = await isBookingActive();
    if (!bookingActive) {
      return {
        success: false,
        message: "Zakazivanje je trenutno pauzirano. Pokušajte kasnije.",
      };
    }

    // 2. Validacija ulaznih podataka
    const parsed = createAppointmentSchema.safeParse(formData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Neispravni podaci.";
      return { success: false, message: firstError };
    }

    const { clientName, clientEmail, clientPhone, startTime, userId, serviceId } =
      parsed.data;

    // 3. Provera da li usluga postoji i izračunavanje endTime
    const service = await getServiceById(serviceId);
    if (!service) {
      return { success: false, message: "Izabrana usluga ne postoji." };
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.durationMinutes * 60 * 1000);

    // 4. Provera da startTime nije u prošlosti
    if (start <= new Date()) {
      return {
        success: false,
        message: "Ne možete zakazati termin u prošlosti.",
      };
    }

    // 5. Provera da nije predaleko u budućnosti (max 2 nedelje)
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    if (start > twoWeeksFromNow) {
      return {
        success: false,
        message: "Možete zakazati termin najdalje 2 nedelje unapred.",
      };
    }

    // 6. Provera da li radnik ima slobodan dan
    const hasTimeOff = await hasTimeOffOnDate(userId, start);
    if (hasTimeOff) {
      return {
        success: false,
        message: "Izabrani frizer ne radi tog dana.",
      };
    }

    // 7. Provera kolizije termina (NE SME IMATI VIŠE LJUDI U ISTOM TERMINU)
    const overlapping = await hasOverlappingAppointment(userId, start, end);
    if (overlapping) {
      return {
        success: false,
        message: "Izabrani termin je već zauzet. Molimo izaberite drugi.",
      };
    }

    // 8. Kreiranje termina
    await createAppointment({
      clientName,
      clientEmail,
      clientPhone,
      startTime: start,
      endTime: end,
      userId,
      serviceId,
    });

    return {
      success: true,
      message: "Termin je uspešno zakazan! Čeka odobrenje frizera.",
    };
  } catch (error) {
    console.error("[BOOKING ACTION] Greška:", error);
    return {
      success: false,
      message: "Došlo je do greške. Pokušajte ponovo.",
    };
  }
}
