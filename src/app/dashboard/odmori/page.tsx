import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId, getTimeOffsByUserId, getAllTimeOffs } from "@/services/staff-service";
import { TimeOffForm } from "@/components/dashboard/timeoff-form";

export const revalidate = 0; // Ensures data is always fresh

export default async function OdmoriPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/sign-in");

  const user = await getUserByClerkId(clerkUserId);
  if (!user) {
    return redirect("/");
  }

  const isAdmin = user.role === "ADMIN";

  const timeoffs = isAdmin ? await getAllTimeOffs() : await getTimeOffsByUserId(user.id);
  
  // Prilagodjavanje tipova za props
  const sanitizedTimeoffs = timeoffs.map((to) => {
     let u: undefined | { name: string } = undefined;
     const t = to as typeof to & { user?: { name: string } };
     if (t.user && typeof t.user.name === "string") {
        u = { name: t.user.name };
     }
     return {
        id: to.id,
        date: to.date,
        reason: to.reason,
        user: u,
     };
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
         <h1 className="text-3xl font-heading font-bold tracking-tight">Odmori i Slobodni dani</h1>
         <p className="text-muted-foreground">Upravljajte slobodnim danima. Sistem neće zakazivati termine na ove datume za odabrane radnike.</p>
      </div>

      <TimeOffForm timeoffs={sanitizedTimeoffs} isAdmin={isAdmin} />
    </div>
  );
}
