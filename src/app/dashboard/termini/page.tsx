import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/services/staff-service";
import { getAllAppointments, getAppointmentsByUserId } from "@/services/booking-service";
import { AppointmentsTable } from "@/components/dashboard/appointments-table";

export const revalidate = 0; // Dynamic

export default async function TerminiPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await getUserByClerkId(clerkUserId);
  if (!user) redirect("/");

  const isAdmin = user.role === "ADMIN";

  // Admin vidi poslednjih 30 termina svih statusa, Staff vidi svojih 30
  const allStatuses = ["PENDING", "APPROVED", "COMPLETED", "CANCELLATION_REQUESTED", "CANCELLED_BY_CLIENT", "REJECTED"] as const;
  const appts = isAdmin
      ? await getAllAppointments([...allStatuses])
      : await getAppointmentsByUserId(user.id, [...allStatuses]);

  return (
    <div className="flex flex-col gap-8">
      <div>
         <h1 className="text-3xl font-heading font-bold tracking-tight">{isAdmin ? "Svi Termini" : "Moji Termini"}</h1>
         <p className="text-muted-foreground">Pregledajte i odobravajte termine klijenata u salonu.</p>
      </div>

      <AppointmentsTable appointments={appts} isAdmin={isAdmin} />
    </div>
  );
}
