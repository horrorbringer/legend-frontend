"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AuthGuard from "@/components/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        await api.get("/sanctum/csrf-cookie");
        const res = await api.get("/admin/profile");
        setAdmin(res.data);
      } catch {
        router.push("/admin/login");
      }
    };
    fetchAdmin();
  }, [router]);

  const handleLogout = async () => {
    await api.post("/api/logout");
    router.push("/admin/login");
  };

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/movies", label: "Movies" },
    { href: "/admin/bookings", label: "Bookings" },
    { href: "/admin/showtimes", label: "Showtimes" },
    { href: "/admin/cinemas", label: "Cinemas" },
  ];

  return (
    <AuthGuard role="admin">
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r shadow-sm p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-4">🎟️ Legend Admin</h2>
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2 rounded-md hover:bg-gray-100",
                  pathname === link.href && "bg-gray-200 font-semibold"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-2">{admin?.email}</p>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
    </AuthGuard>
  );
}
