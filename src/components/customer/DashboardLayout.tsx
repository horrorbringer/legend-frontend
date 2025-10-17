"use client";

import { DashboardNav } from "@/components/customer/DashboardNav";
import { UserButton } from "@/components/customer/UserButton";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="fixed top-0 z-40 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
        <div className="container flex h-14 items-center px-4">
          <div className="mr-4 flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex w-full justify-between">
            <div className="flex">
              <Link href="/" className="flex items-center space-x-2">
                <span className="font-bold text-xl text-white">Legend</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Side Navigation */}
        <aside className={cn(
          "fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r border-gray-800 md:sticky md:block",
          showMobileMenu && "block"
        )}>
          <div className="relative h-full py-6 pl-8 pr-6 lg:py-8">
            <DashboardNav />
          </div>
        </aside>

        {/* Main Content */}
        <main className="relative py-6 px-4 md:px-6 lg:px-8 max-w-full min-h-screen pt-20">
          {children}
        </main>
      </div>
    </div>
  );
}