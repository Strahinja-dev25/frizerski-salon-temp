import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/services/staff-service";
import { getDashboardStats, getAppointmentsByUserId, getAllAppointments } from "@/services/booking-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Search, Users, CalendarCheck2, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { srLatn } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export const revalidate = 0; // Dynamic page

export default async function DashboardPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const user = await getUserByClerkId(clerkUserId);
  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  // Fetch stats (Admin = salon total, Staff = their own)
  const stats = await getDashboardStats(isAdmin ? undefined : user.id);

  // Fetch upcoming appointments
  const appointments = isAdmin
    ? await getAllAppointments(["PENDING", "APPROVED", "CANCELLATION_REQUESTED"])
    : await getAppointmentsByUserId(user.id, ["PENDING", "APPROVED", "CANCELLATION_REQUESTED"]);

  // Ograniči na prvih 10 za danas/sutra
  const upcoming = appointments
    .filter(a => new Date(a.startTime) > new Date(new Date().setHours(0, 0, 0, 0)))
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-8">

      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight">Pregled</h1>
        <p className="text-muted-foreground">Dobrodošli nazad, {user.name}.</p>
      </div>

      {/* STATS KARTICE */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Današnji Prihod</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.todayRevenue.toLocaleString('sr-RS')} <span className="text-lg text-muted-foreground font-medium">RSD</span></div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mesečni Prihod</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.monthRevenue.toLocaleString('sr-RS')} <span className="text-lg text-muted-foreground font-medium">RSD</span></div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Današnji Termini</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.todayAppointments}</div>
          </CardContent>
        </Card>
      </div>

      {/* RECENT APPOINTMENTS HEADER */}
      <div className="flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold font-heading">Naredni termini</h2>
        <a href="/dashboard/termini">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            Pregled Termina
          </Button>
        </a>
      </div>

      {/* APPOINTMENTS LIST */}
      <div className="flex flex-col gap-3">
        {upcoming.length === 0 ? (
          <Card className="glass-panel border-dashed border-2">
            <CardContent className="p-12 text-center flex flex-col items-center justify-center">
              <CalendarCheck2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h4 className="text-xl font-bold mb-2">Nema zakazanih termina</h4>
              <p className="text-muted-foreground">Trenutno nemate termina na čekanju ili za danas.</p>
            </CardContent>
          </Card>
        ) : (
          upcoming.map((appt) => {
            const isPending = appt.status === "PENDING";
            return (
              <Card key={appt.id} className="glass-panel flex flex-col sm:flex-row justify-between sm:items-center p-4 md:p-6 gap-6 hover:border-primary/50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <span className="font-bold font-heading text-lg text-muted-foreground">{appt.clientName[0]}</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-bold text-lg leading-tight">{appt.clientName}</p>
                    <p className="text-muted-foreground">{appt.service.name} • <span className="font-medium text-primary">{appt.service.price} RSD</span></p>
                    {isAdmin && <p className="text-xs text-muted-foreground mt-1">Frizer: <span className="font-medium text-foreground">{appt.user.name}</span></p>}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end justify-center min-w-[200px]">
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {format(new Date(appt.startTime), "HH:mm")} - {format(new Date(appt.endTime), "HH:mm")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(appt.startTime), "dd. MMM yyyy.", { locale: srLatn })}
                  </div>
                  {isPending && (
                    <div className="mt-2 inline-flex border border-amber-500/20 bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 rounded-full font-bold">Na čekanju</div>
                  )}
                  {appt.status === "APPROVED" && (
                    <div className="mt-2 text-primary text-xs font-bold flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" />Odobreno</div>
                  )}
                  {appt.status === "CANCELLATION_REQUESTED" && (
                    <div className="mt-2 inline-flex border border-red-500/20 bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">Zahtev za otkazivanje</div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
}
