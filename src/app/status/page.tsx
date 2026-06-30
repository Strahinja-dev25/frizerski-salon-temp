import { Metadata } from "next";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { getAppointmentsByClientEmail } from "@/services/booking-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";
import { Clock, Calendar as CalendarIcon, Scissors, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deletePendingAppointment } from "@/services/booking-service";
import { CancelButton } from "@/components/public/cancel-button";
import { ApprovedCancelButton } from "@/components/public/approved-cancel-button";
import { canClientCancelDirectly } from "@/services/appointment-service";

export const metadata: Metadata = {
  title: "Status Termina - TestFriz Salon",
  description: "Proverite status vašeg zakazanog termina ili otkažite termin.",
};

// Next 15 searchParams are a Promise
export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const email = typeof resolvedParams.email === "string" ? resolvedParams.email : null;
  const cancelId = typeof resolvedParams.cancel === "string" ? resolvedParams.cancel : null;

  // Handle canceling a pending appointment
  if (cancelId && email) {
     await deletePendingAppointment(cancelId);
     redirect(`/status?email=${encodeURIComponent(email)}&cancelled=true`);
  }

  // Fetch appointments
  const appointments = email ? await getAppointmentsByClientEmail(email) : null;
  const isCancelled = resolvedParams.cancelled === "true";

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 md:py-32 max-w-4xl">
        <div className="mb-8">
           <Link href="/">
              <Button variant="ghost" className="-ml-4 text-muted-foreground hover:text-foreground">
                 <ArrowLeft className="w-4 h-4 mr-2" /> Nazad na početnu
              </Button>
           </Link>
        </div>

        <div className="mb-12">
          <h1 className="font-heading text-4xl font-bold tracking-tight mb-4 text-foreground">
            Status <span className="text-gradient-primary">termina</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Unesite email adresu sa kojom ste zakazali kako bi videli vaš aktuelni ili prethodne termine.
          </p>
        </div>
        
        <Card className="glass mb-12">
           <CardContent className="p-6 md:p-8">
              <form className="flex flex-col sm:flex-row gap-4 max-w-xl" method="GET" action="/status">
                 <Input 
                    type="email" 
                    name="email" 
                    placeholder="vas@email.com" 
                    defaultValue={email || ""}
                    className="h-12 flex-1"
                    required
                 />
                 <Button type="submit" size="lg" className="h-12 w-full sm:w-auto rounded-full font-bold">
                    Proveri status
                 </Button>
              </form>
           </CardContent>
        </Card>

        {isCancelled && (
           <div className="bg-destructive/15 text-destructive border border-destructive/20 p-4 rounded-xl mb-8 flex border-l-4 border-l-destructive">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
              <p>Vaš termin je uspešno otkazan.</p>
           </div>
        )}

        {email && appointments && (
           <div className="space-y-6">
              <h3 className="font-heading font-bold text-2xl mb-6">Pronađeni termini ({appointments.length})</h3>
              
              {appointments.length === 0 ? (
                 <div className="text-center p-12 bg-background rounded-2xl border border-border border-dashed">
                    <p className="text-muted-foreground">Nemate zakazanih termina u poslednjih 20 dana sa ovom email adresom.</p>
                 </div>
              ) : (
                 <div className="grid gap-4">
                    {appointments.map((appt) => {
                        const isPending = appt.status === "PENDING";
                        const isApproved = appt.status === "APPROVED";
                        const isRejected = appt.status === "REJECTED";
                        const isCancelledClient = appt.status === "CANCELLED_BY_CLIENT";
                        const isCancellationRequested = appt.status === "CANCELLATION_REQUESTED";
                        const isCompleted = appt.status === "COMPLETED";

                        // Provera 18h pravila za odobrene termine
                        const canDirectCancel = isApproved ? canClientCancelDirectly(appt.startTime) : false;

                        return (
                           <Card key={appt.id} className="overflow-hidden glass-panel">
                              <div className={`h-2 w-full ${isPending ? 'bg-amber-400' : isApproved ? 'bg-primary' : isCancellationRequested ? 'bg-amber-500' : isCompleted ? 'bg-green-500' : isRejected ? 'bg-destructive' : 'bg-muted-foreground'}`} />
                              <CardContent className="p-6">
                                 <div className="flex flex-col md:flex-row justify-between gap-6">
                                    
                                    <div className="flex flex-col gap-4 flex-1">
                                       <div className="flex items-center gap-3">
                                          <div className="bg-muted p-2 rounded-lg">
                                             <Scissors className="w-5 h-5 text-primary" />
                                          </div>
                                          <div>
                                             <h4 className="font-bold text-lg">{appt.service.name}</h4>
                                             <p className="text-sm text-muted-foreground">Kod frizera: <span className="font-medium text-foreground">{appt.user.name}</span></p>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="flex flex-col gap-2 md:items-end justify-center">
                                       <div className="flex items-center gap-2 text-foreground font-medium">
                                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                          {new Date(appt.startTime).toLocaleString("sr-Latn-RS", { timeZone: "Europe/Belgrade", day: "2-digit", month: "long", year: "numeric" }) + "."}
                                       </div>
                                       <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                                          <Clock className="w-4 h-4 text-muted-foreground" />
                                          {new Date(appt.startTime).toLocaleString("sr-Latn-RS", { timeZone: "Europe/Belgrade", hour: "2-digit", minute: "2-digit" })}
                                       </div>
                                    </div>

                                    <div className="flex flex-col md:items-end justify-center gap-3 min-w-[180px]">
                                       <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-background border">
                                          {isPending && <span className="text-amber-500 flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" /> Na čekanju</span>}
                                          {isApproved && <span className="text-primary flex items-center"><span className="w-2 h-2 rounded-full bg-primary mr-2" /> Odobren</span>}
                                          {isCancellationRequested && <span className="text-amber-500 flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" /> Zahtev poslat</span>}
                                          {isCompleted && <span className="text-green-600 flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2" /> Završen</span>}
                                          {isRejected && <span className="text-destructive flex items-center"><span className="w-2 h-2 rounded-full bg-destructive mr-2" /> Odbijen</span>}
                                          {isCancelledClient && <span className="text-muted-foreground flex items-center"><span className="w-2 h-2 rounded-full bg-muted-foreground mr-2" /> Otkazan</span>}
                                       </div>
                                       
                                       {isPending && (
                                          <form action="/status" method="GET">
                                             <input type="hidden" name="email" value={email} />
                                             <input type="hidden" name="cancel" value={appt.id} />
                                             <CancelButton />
                                          </form>
                                       )}

                                       {isApproved && (
                                          <ApprovedCancelButton
                                             appointmentId={appt.id}
                                             clientEmail={email}
                                             canDirectCancel={canDirectCancel}
                                          />
                                       )}

                                       {isCancellationRequested && (
                                          <p className="text-xs text-amber-500 italic">Čeka se odobrenje frizera</p>
                                       )}
                                    </div>
                                    
                                 </div>
                              </CardContent>
                           </Card>
                       );
                    })}
                 </div>
              )}
           </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
