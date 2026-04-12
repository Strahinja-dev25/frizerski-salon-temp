// ============================================================================
// Cron Cleanup API ruta — brisanje starih termina
// ============================================================================
// Poziva se preko Vercel Cron Jobs svake noći u 00:00.
// Zaštićena CRON_SECRET ključem.
// Briše sve termine starije od 20 dana.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { deleteOldAppointments } from "@/services/booking-service";

export async function GET(request: NextRequest) {
  try {
    // Provera autorizacije sa tajnim ključem
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET nije definisan u environment varijablama.");
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

    // Brisanje starih termina
    const deletedCount = await deleteOldAppointments();

    console.log(`[CRON] Obrisano ${deletedCount} termina starijih od 20 dana.`);

    return NextResponse.json({
      success: true,
      message: `Obrisano ${deletedCount} starih termina.`,
      deletedCount,
    });
  } catch (error) {
    console.error("[CRON] Greška prilikom čišćenja:", error);
    return NextResponse.json(
      { success: false, message: "Interna greška servera." },
      { status: 500 }
    );
  }
}
