import { Metadata } from "next";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { BookingForm } from "@/components/public/booking-form";
import { getAllServices } from "@/services/appointment-service";
import { getAllStaff } from "@/services/staff-service";
import { getSalonSettings } from "@/services/settings-service";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Zakaži Termin - TestFriz Salon",
  description: "Zakažite vaš termin online brzo i jednostavno. Izaberite uslugu, majstora i vreme koje vam odgovara.",
};

export const revalidate = 0; // Ensures data is always fresh

export default async function BookingPage() {
  const [services, staff, settings] = await Promise.all([
    getAllServices(),
    getAllStaff(),
    getSalonSettings()
  ]);

  if (settings && !settings.isBookingActive) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center max-w-2xl">
          <div className="bg-destructive/10 p-4 rounded-full mb-6">
            <span className="text-destructive font-bold text-4xl">!</span>
          </div>
          <h1 className="text-4xl font-heading font-bold mb-4">Zakazivanje privremeno onemogućeno</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Zakazivanje novih termina je trenutno pauzirano. Molimo proverite kasnije ili nas pozovite telefonom za vise informacija.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // Mapiranje podataka iz Prisma u jednostavniji tip za frontend komponente (Service, Staff)
  const mappedServices = services.map(s => ({
    id: s.id,
    name: s.name,
    price: s.price,
    durationMinutes: s.durationMinutes,
  }));

  const mappedStaff = staff.map(s => ({
    id: s.id,
    name: s.name,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 md:py-32 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            Zakažite <span className="text-gradient-primary">svoj termin</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Pratite jednostavne korake i u par klikova dođite do novog izgleda.
          </p>
        </div>
        
        <BookingForm services={mappedServices} staff={mappedStaff} />
        
      </main>
      <Footer />
    </div>
  );
}
