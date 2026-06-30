// ============================================================================
// Cron Podsetnici — jutarnje obaveštenje klijentima
// ============================================================================
// Pokreće se svako jutro u 06:00 (Srbija, UTC+2 leti = 04:00 UTC).
// Dohvata sve ODOBRENE termine za danas i šalje podsetnik klijentima.
// Zaštićena CRON_SECRET ključem — niko spolja ne može da je pozove.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getTodayApprovedAppointments } from "@/services/booking-service";
import { sendAppointmentReminderEmail } from "@/lib/email-service";

export async function GET(request: NextRequest) {
  try {
    // --- Autorizacija ---
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[CRON PODSETNICI] CRON_SECRET nije definisan.");
      return NextResponse.json(
        { success: false, message: "Server konfiguracija nedostaje." },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: "Neautorizovan pristup." },
        { status: 401 }
      );
    }

    // --- Dohvati sve odobrene termine za danas ---
    const todayAppointments = await getTodayApprovedAppointments();

    if (todayAppointments.length === 0) {
      console.log("[CRON PODSETNICI] Nema odobrenih termina za danas.");
      return NextResponse.json({
        success: true,
        message: "Nema termina za danas.",
        sent: 0,
      });
    }

    // --- Pošalji podsetnik svakom klijentu ---
    // Koristimo Promise.allSettled da greška kod jednog mejla ne zaustavi ostale
    const results = await Promise.allSettled(
      todayAppointments.map((appointment) =>
        sendAppointmentReminderEmail({
          clientName: appointment.clientName,
          clientEmail: appointment.clientEmail,
          serviceName: appointment.service.name,
          staffName: appointment.user.name,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          price: appointment.service.price,
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`[CRON PODSETNICI] Poslato: ${sent}, Greška: ${failed}, Ukupno: ${todayAppointments.length}`);

    return NextResponse.json({
      success: true,
      message: `Podsetnici poslati za ${sent} od ${todayAppointments.length} termina.`,
      sent,
      failed,
    });
  } catch (error) {
    console.error("[CRON PODSETNICI] Greška:", error);
    return NextResponse.json(
      { success: false, message: "Interna greška servera." },
      { status: 500 }
    );
  }
}
