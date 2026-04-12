import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/services/staff-service";
import { getAllServices } from "@/services/appointment-service";
import { ServicesTable } from "@/components/dashboard/services-table";

export const revalidate = 0; // Ensures data is always fresh

export default async function ServicesPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await getUserByClerkId(clerkUserId);
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
        Nemate administratorski pristup ovoj stranici.
      </div>
    );
  }

  const services = await getAllServices();

  return (
    <div className="flex flex-col gap-8">
      <div>
         <h1 className="text-3xl font-heading font-bold tracking-tight">Usluge</h1>
         <p className="text-muted-foreground">Upravljajte uslugama koje salon nudi na početnoj stranici.</p>
      </div>

      <ServicesTable services={services} />
    </div>
  );
}
