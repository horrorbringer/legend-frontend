"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Film, User, LogOut, Menu, X, Ticket, LayoutDashboard, Popcorn, Clock, Search } from "lucide-react";
import { useState, useEffect } from "react";
import ClientFooter from "./ClientFooter";

function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before checking scroll
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    // Set initial scroll state
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  // Prevent hydration mismatch by using consistent initial state
  const navClasses = mounted && scrolled
    ? "bg-black/95 backdrop-blur-lg shadow-lg shadow-black/50"
    : "bg-gradient-to-b from-black/80 to-transparent";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClasses}`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Film className="w-8 h-8 text-red-600 group-hover:text-red-500 transition-colors" />
              <div className="absolute inset-0 bg-red-600/20 blur-xl group-hover:bg-red-600/40 transition-all" />
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-black text-red-600 group-hover:text-red-500 transition-colors">
                Legend
              </span>
              <span className="text-2xl font-light text-white">Cinema</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link href="/movies">
              <Button
                variant="ghost"
                className={`text-white hover:text-red-600 hover:bg-red-600/10 transition-colors ${
                  isActive("/movies") ? "text-red-600 bg-red-600/10" : ""
                }`}
              >
                <Film className="w-4 h-4 mr-2" />
                Movies
              </Button>
            </Link>

            <Link href="/showtimes">
              <Button
                variant="ghost"
                className={`text-white hover:text-red-600 hover:bg-red-600/10 transition-colors ${
                  isActive("/showtimes") ? "text-red-600 bg-red-600/10" : ""
                }`}
              >
                <Clock className="w-4 h-4 mr-2" />
                Showtimes
              </Button>
            </Link>

            {user?.role === "customer" && (
              <Link href="/customer/dashboard">
                <Button
                  variant="ghost"
                  className={`text-white hover:text-red-600 hover:bg-red-600/10 transition-colors ${
                    isActive("/customer/dashboard") ? "text-red-600 bg-red-600/10" : ""
                  }`}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  My Bookings
                </Button>
              </Link>
            )}

            {user?.role === "admin" && (
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  className={`text-white hover:text-red-600 hover:bg-red-600/10 transition-colors ${
                    isActive("/admin/dashboard") ? "text-red-600 bg-red-600/10" : ""
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            )}

            <Link href="/concessions">
              <Button
                variant="ghost"
                className={`text-white hover:text-red-600 hover:bg-red-600/10 transition-colors ${
                  isActive("/concessions") ? "text-red-600 bg-red-600/10" : ""
                }`}
              >
                <Popcorn className="w-4 h-4 mr-2" />
                Concessions
              </Button>
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-red-600 hover:bg-red-600/10"
            >
              <Search className="w-5 h-5" />
            </Button>

            {!user ? (
              <>
                <Link href="/customer/login">
                  <Button
                    variant="outline"
                    className="border-white/20 text-black hover:bg-white/50 hover:border-white/40"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/customer/register">
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/30">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-600/50 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:text-red-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-white/10 animate-in slide-in-from-top duration-300">
            <Link
              href="/movies"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/movies")
                  ? "bg-red-600/20 text-red-600"
                  : "text-white hover:bg-white/5"
              }`}
            >
              <Film className="w-5 h-5" />
              <span className="font-medium">Movies</span>
            </Link>

            <Link
              href="/showtimes"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/showtimes")
                  ? "bg-red-600/20 text-red-600"
                  : "text-white hover:bg-white/5"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-medium">Showtimes</span>
            </Link>

            {user?.role === "customer" && (
              <Link
                href="/customer/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive("/customer/bookings")
                    ? "bg-red-600/20 text-red-600"
                    : "text-white hover:bg-white/5"
                }`}
              >
                <Ticket className="w-5 h-5" />
                <span className="font-medium">My Bookings</span>
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive("/admin/dashboard")
                    ? "bg-red-600/20 text-red-600"
                    : "text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
            )}

            <Link
              href="/concessions"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/concessions")
                  ? "bg-red-600/20 text-red-600"
                  : "text-white hover:bg-white/5"
              }`}
            >
              <Popcorn className="w-5 h-5" />
              <span className="font-medium">Concessions</span>
            </Link>

            <div className="pt-4 border-t border-white/10">
              {!user ? (
                <div className="space-y-3">
                  <Link href="/customer/login" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-white/20 text-black hover:bg-white/50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/customer/register" className="block">
                    <Button
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-red-600/50 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages where you don't want the navbar
  const noNavbarPages = [
    "/customer/login",
    "/customer/register",
    "/admin/login",
    "/admin/register",
  ];

  const showNavbar = !noNavbarPages.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={`${showNavbar ? "pt-20" : ""} min-h-screen bg-black`}>
        {children}

        {/* Footer */}
      <ClientFooter />
      </div>
    </>
  );
}