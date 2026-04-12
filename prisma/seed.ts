// ============================================================================
// Seed skripta — inicijalizacija baze podataka
// ============================================================================
// Kreira:
// 1. SalonSettings sa id: "global" (jedno podešavanje za ceo salon)
// 2. WorkSchedule za svaki dan u nedelji (Pon-Sub radni, Ned neradna)
// 3. Demo usluge (za testiranje i prezentaciju klijentu)
// ============================================================================

import { PrismaClient, DayOfWeek } from "@prisma/client";

const prisma = new PrismaClient();

/** Definicija radnog vremena po danima — lako izmenljivo za svakog klijenta */
const WORK_SCHEDULE_DEFAULTS: Array<{
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}> = [
  { dayOfWeek: "MONDAY", isOpen: true, openingTime: "09:00", closingTime: "20:00" },
  { dayOfWeek: "TUESDAY", isOpen: true, openingTime: "09:00", closingTime: "20:00" },
  { dayOfWeek: "WEDNESDAY", isOpen: true, openingTime: "09:00", closingTime: "20:00" },
  { dayOfWeek: "THURSDAY", isOpen: true, openingTime: "09:00", closingTime: "20:00" },
  { dayOfWeek: "FRIDAY", isOpen: true, openingTime: "09:00", closingTime: "20:00" },
  { dayOfWeek: "SATURDAY", isOpen: true, openingTime: "09:00", closingTime: "17:00" },
  { dayOfWeek: "SUNDAY", isOpen: false, openingTime: "00:00", closingTime: "00:00" },
];

/** Demo usluge — zamenjuju se pravim uslugama za svakog klijenta */
const DEMO_SERVICES = [
  {
    name: "Muško šišanje",
    description: "Klasično muško šišanje sa stilizovanjem.",
    price: 1500,
    durationMinutes: 30,
  },
  {
    name: "Trimovanje brade",
    description: "Precizno oblikovanje i trimovanje brade.",
    price: 800,
    durationMinutes: 15,
  },
  {
    name: "Pranje i feniranje",
    description: "Pranje kose profesionalnim šamponom i feniranje.",
    price: 500,
    durationMinutes: 20,
  },
  {
    name: "Komplet paket",
    description: "Šišanje, trimovanje brade, pranje i stilizovanje.",
    price: 2500,
    durationMinutes: 60,
  },
];

async function main() {
  console.log("🌱 Pokretanje seed skripte...");

  // 1. Kreiranje globalnih podešavanja (upsert da se ne duplira)
  const settings = await prisma.salonSettings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      isBookingActive: true,
      openingTime: "09:00",
      closingTime: "20:00",
    },
  });
  console.log("✅ SalonSettings kreiran:", settings.id);

  // 2. Kreiranje rasporeda za svaki dan u nedelji
  for (const schedule of WORK_SCHEDULE_DEFAULTS) {
    await prisma.workSchedule.upsert({
      where: { dayOfWeek: schedule.dayOfWeek },
      update: {
        isOpen: schedule.isOpen,
        openingTime: schedule.openingTime,
        closingTime: schedule.closingTime,
      },
      create: {
        dayOfWeek: schedule.dayOfWeek,
        isOpen: schedule.isOpen,
        openingTime: schedule.openingTime,
        closingTime: schedule.closingTime,
        salonSettingsId: "global",
      },
    });
  }
  console.log("✅ WorkSchedule kreiran za 7 dana u nedelji");

  // 3. Kreiranje demo usluga
  for (const service of DEMO_SERVICES) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name },
    });

    if (!existing) {
      await prisma.service.create({ data: service });
    }
  }
  console.log("✅ Demo usluge kreirane:", DEMO_SERVICES.length);

  console.log("🎉 Seed skripta uspešno završena!");
}

main()
  .catch((e) => {
    console.error("❌ Greška prilikom seed-a:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
