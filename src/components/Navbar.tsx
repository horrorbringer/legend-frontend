"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-xl font-bold text-yellow-400">
          🎬 MovieHub
        </Link>
        <Link href="/movies" className="hover:text-yellow-300">
          Movies
        </Link>
        {user?.role === "customer" && (
          <Link href="/customer/bookings" className="hover:text-yellow-300">
            My Bookings
          </Link>
        )}
        {user?.role === "admin" && (
          <Link href="/admin/dashboard" className="hover:text-yellow-300">
            Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {!user ? (
          <>
            <Link href="/login">
              <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-yellow-400 text-black hover:bg-yellow-300">
                Register
              </Button>
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm">👤 {user.name}</span>
            <Button onClick={handleLogout} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white">
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
