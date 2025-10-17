"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Film,
  Building2,
  Users,
  CalendarDays,
  Clock,
  Settings,
  Banknote,
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard
  },
  {
    name: "Movies",
    href: "/admin/movies",
    icon: Film
  },
  {
    name: "Cinemas",
    href: "/admin/cinemas",
    icon: Building2
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users
  },
  {
    name: "Showtimes",
    href: "/admin/showtimes",
    icon: Clock
  },
  {
    name: "Bookings",
    href: "/admin/dashboard/bookings",
    icon: CalendarDays
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: Banknote
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === link.href
                ? "bg-gray-800/50 text-white hover:bg-gray-800/60"
                : "text-gray-400 hover:text-white hover:bg-gray-800/30",
              "justify-start w-full"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}