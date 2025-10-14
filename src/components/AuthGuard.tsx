"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children, role }: { children: React.ReactNode; role?: "admin" | "customer" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push(role === "admin" ? "/admin/login" : "/login");
      else if (role && user.role !== role) router.push("/");
    }
  }, [user, loading]);

  if (loading) return <div>Loading...</div>;
  return <>{children}</>;
}
