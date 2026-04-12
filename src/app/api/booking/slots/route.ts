import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { getAppointmentsByUserId } from "@/services/booking-service";
import { getAllWorkSchedules, getWorkScheduleByDay } from "@/services/settings-service";
import { format, parse, addMinutes, isBefore, startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  const staffId = searchParams.get("staffId");
  const durationStr = searchParams.get("duration");

  if (!dateStr || !staffId || !durationStr) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const durationMin = parseInt(durationStr, 10);
  const targetDate = new Date(dateStr);
  const jsDayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon
  
  const prismaDays: ("SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY")[] = [
     "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"
  ];
  const dayOfWeekEnum = prismaDays[jsDayOfWeek];

  try {
    // 1. Proveri radno vreme za taj dan
    const schedule = await getWorkScheduleByDay(dayOfWeekEnum);
    if (!schedule || !schedule.isOpen || !schedule.openingTime || !schedule.closingTime) {
      return NextResponse.json({ slots: [] }); // Zatvoreno
    }

    // 2. Proveri TimeOff za radnika na taj dan
    const timeOff = await db.timeOff.findFirst({
      where: {
        userId: staffId,
        date: {
          gte: startOfDay(targetDate),
          lte: endOfDay(targetDate),
        },
      },
    });

    if (timeOff) {
      return NextResponse.json({ slots: [] }); // Radnik je na odmoru taj dan
    }

    // 3. Dohvati sve termine radnika za taj dan (APPROVED ili PENDING)
    const appointments = await db.appointment.findMany({
      where: {
        userId: staffId,
        status: { in: ["APPROVED", "PENDING"] },
        startTime: {
          gte: startOfDay(targetDate),
          lt: endOfDay(targetDate),
        },
      },
      orderBy: { startTime: "asc" },
    });

    // 4. Generiši sve moguće slotove
    const slots: string[] = [];
    let currentSlot = parse(schedule.openingTime, "HH:mm", targetDate);
    const closeTime = parse(schedule.closingTime, "HH:mm", targetDate);
    
    // Ograničenje: Ne može se zakazati u prošlosti
    const now = new Date();

    while (addMinutes(currentSlot, durationMin) <= closeTime) {
      const slotStart = currentSlot;
      const slotEnd = addMinutes(currentSlot, durationMin);

      // Skok za sledeci moguci termin (npr svakih 30 min ili na osnovu duration)
      // Koristicemo inkrement od 30 min za estetiku
      const slotIncrement = 30;

      // Da li je slot u prošlosti? (Dodajemo 1 sat bafera po pravilu ili slicno? Ne, samo ne u proslosti)
      if (isBefore(slotStart, now)) {
        currentSlot = addMinutes(currentSlot, slotIncrement);
        continue;
      }

      // Da li se preklapa sa nekim zakazanim terminom?
      const isOverlapping = appointments.some((appt) => {
        // formula: StartA < EndB && EndA > StartB
        return slotStart < appt.endTime && slotEnd > appt.startTime;
      });

      if (!isOverlapping) {
        slots.push(format(slotStart, "HH:mm"));
      }

      currentSlot = addMinutes(currentSlot, slotIncrement);
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
