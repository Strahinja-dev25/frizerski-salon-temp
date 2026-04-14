import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId, getAllUsers } from "@/services/staff-service";
import { StaffTable } from "@/components/dashboard/staff-table";

export const revalidate = 0; // Ensures data is always fresh

export default async function RadniciPage() {
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

  const staffList = await getAllUsers();

  return (
    <div className="flex flex-col gap-8">
      <div>
         <h1 className="text-3xl font-heading font-bold tracking-tight">Radnici</h1>
         <p className="text-muted-foreground">Upravljajte pristupom osoblja salonu. Status Administratora daje radniku pristup svim tabelama i finansijama.</p>
      </div>

      <StaffTable staff={staffList} />
    </div>
  );
}
