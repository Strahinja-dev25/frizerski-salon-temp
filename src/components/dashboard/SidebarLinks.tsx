"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    CalendarDays,
    LayoutDashboard,
    Scissors,
    Settings,
    Users,
} from "lucide-react";

interface SidebarLinksProps {
    isAdmin: boolean;
}

export default function SidebarLinks({ isAdmin }: SidebarLinksProps) {
    const pathname = usePathname();

    const adminLinks = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Svi Termini", href: "/dashboard/termini", icon: CalendarDays },
        { name: "Odobravanje/Odmori", href: "/dashboard/odmori", icon: CalendarDays },
        { name: "Usluge", href: "/dashboard/usluge", icon: Scissors },
        { name: "Radnici", href: "/dashboard/radnici", icon: Users },
        { name: "Podešavanja", href: "/dashboard/podesavanja", icon: Settings },
    ];

    const staffLinks = [
        { name: "Početna", href: "/dashboard", icon: LayoutDashboard },
        { name: "Moji Termini", href: "/dashboard/termini", icon: CalendarDays },
        { name: "Slobodni dani", href: "/dashboard/odmori", icon: CalendarDays },
    ];

    const links = isAdmin ? adminLinks : staffLinks;

    return (
        <>
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                    <Link key={link.name} href={link.href}>
                        <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={`w-full justify-start gap-3 mb-1 transition-colors ${isActive
                                ? "bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-gray-200 dark:hover:bg-zinc-800"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{link.name}</span>
                        </Button>
                    </Link>
                );
            })}
        </>
    );
}
