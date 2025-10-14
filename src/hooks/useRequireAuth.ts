"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireAuth(role: "admin" | "customer") {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== role)) {
      router.push(role === "admin" ? "/admin/login" : "/login");
    }
  }, [user, loading, role, router]);

  return { user, loading };
}
