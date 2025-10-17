"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Film, CalendarDays, User } from "lucide-react";

const links = [
  {
    name: "Dashboard",
    href: "/customer/dashboard",
    icon: Home
  },
  {
    name: "Movies",
    href: "/movies",
    icon: Film
  },
  {
    name: "My Bookings",
    href: "/bookings",
    icon: CalendarDays
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User
  }
];

export function DashboardNav() {
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