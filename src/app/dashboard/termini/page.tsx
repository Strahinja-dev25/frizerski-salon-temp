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

  // Ukoliko je Admin vidi sve aktivne termine. Ukoliko je Staff vidi samo svoje.
  const appts = isAdmin 
      ? await getAllAppointments(["PENDING", "APPROVED"])
      : await getAppointmentsByUserId(user.id, ["PENDING", "APPROVED"]);

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
