import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/services/staff-service";
import { getSalonSettings, getAllWorkSchedules } from "@/services/settings-service";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const revalidate = 0; // Ensures data is always fresh

export default async function SettingsPage() {
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

  const settings = await getSalonSettings();
  const schedules = await getAllWorkSchedules();

  return (
    <div className="flex flex-col gap-8">
      <div>
         <h1 className="text-3xl font-heading font-bold tracking-tight">Podešavanja</h1>
         <p className="text-muted-foreground">Upravljajte parametrima celokupnog sajta, radnim vremenom i statusom zakazivanja.</p>
      </div>

      <SettingsForm 
         isBookingActive={settings?.isBookingActive ?? true} 
         schedules={schedules} 
      />
    </div>
  );
}
