"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export type Role = "admin" | "customer";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Verify token with backend
          const response = await api.get("/api/verify-token");
          // If verification successful, keep the saved user
          if (response.data.success) {
            setUser(JSON.parse(savedUser));
          } else {
            throw new Error('Token invalid');
          }
        } catch (error) {
          // If verification fails, clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string, role: Role) => {
    
    const endpoint = role === "admin" ? "/api/admin/login" : "/api/customer/login";
  
    const res = await api.post(endpoint, { email, password });
    
    const { user, token } = res.data;
    
    // Save to localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    
    setUser(user);
    
    // Check if there's a redirect URL in the query params or localStorage
    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = searchParams.get('redirect') || localStorage.getItem('redirectAfterLogin');
    
    // Clear the stored redirect
    localStorage.removeItem('redirectAfterLogin');
    
    // Redirect to the intended page or default dashboard
    if (redirectUrl && redirectUrl.startsWith('/')) {
      router.push(redirectUrl);
    } else {
      router.push(role === "admin" ? "/admin/dashboard" : "/customer/dashboard");
    }
  };

  const logout = async () => {
    try {
      await api.post(
        user?.role === "customer" ? "/api/customer/logout" : "/api/admin/logout"
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};