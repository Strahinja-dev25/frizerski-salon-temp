import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/services/staff-service";
import { UserButton } from "@clerk/nextjs";
import {
  CalendarDays,
  LayoutDashboard,
  Scissors,
  Settings,
  Users,
  LogOut,
  Home,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  const user = await getUserByClerkId(clerkUserId);

  if (!user) {
    // Ako korisnik nije u bazi (admin ga nije dodao, ili nije prosao sync webhook)
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 pb-20">
        <div className="text-center">
           <h2 className="text-2xl font-bold mb-2">Nemate pristup sistemu</h2>
           <p className="text-muted-foreground mb-4">Molimo kontaktirajte administratora da vam dodeli ulogu.</p>
           <UserButton />
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";

  const adminLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Svi Termini", href: "/dashboard/termini", icon: CalendarDays },
    { name: "Odobravanje/Odmori", href: "/dashboard/odmori", icon: CalendarDays },
    { name: "Usluge", href: "/dashboard/usluge", icon: Scissors },
    { name: "Radnici", href: "/dashboard/radnici", icon: Users },
    { name: "Podešavanja", href: "/dashboard/podesavanja", icon: Settings },
  ];

  const staffLinks = [
    { name: "Moji Termini", href: "/dashboard", icon: CalendarDays },
    { name: "Slobodni dani", href: "/dashboard/odmori", icon: CalendarDays },
  ];

  const links = isAdmin ? adminLinks : staffLinks;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-background border-r border-border w-64 p-4 shrink-0 shadow-sm">
      <div className="flex items-center gap-2 mb-8 px-2 py-4 border-b border-border">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
          <Scissors className="h-5 w-5" />
        </div>
        <span className="font-heading font-bold text-xl tracking-tight">TestFriz</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.name} href={link.href}>
              <Button variant="ghost" className="w-full justify-start gap-3 mb-1 text-muted-foreground hover:text-foreground">
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4 px-2 space-y-4">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <UserButton />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">{user.name}</span>
                <span className="text-xs text-muted-foreground">{isAdmin ? "Administrator" : "Frizer"}</span>
              </div>
           </div>
           <ThemeToggle />
         </div>
         <Link href="/">
            <Button variant="outline" className="w-full justify-start text-muted-foreground">
               <Home className="w-4 h-4 mr-2" /> Nazad na sajt
            </Button>
         </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
         {sidebarContent}
      </div>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center justify-between px-4">
         <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
               <Scissors className="h-4 w-4" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight">TestFriz</span>
         </div>
         <Sheet>
            <SheetTrigger className="shrink-0 flex items-center justify-center w-10 h-10 hover:bg-muted rounded-full transition-colors">
               <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
               {sidebarContent}
            </SheetContent>
         </Sheet>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto mt-16 md:mt-0 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
           {children}
        </div>
      </main>
      
    </div>
  );
}
