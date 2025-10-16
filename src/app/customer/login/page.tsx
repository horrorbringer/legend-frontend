"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function CustomerLoginPage() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Store redirect URL if provided
      if (redirectUrl) {
        localStorage.setItem('redirectAfterLogin', redirectUrl);
      }
      
      await login(email, password, "customer");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 backdrop-blur-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">
            {redirectUrl ? 'Login to continue booking' : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don't have an account?{" "}
          <Link 
            href={`/customer/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-red-500 hover:text-red-400 font-semibold"
          >
            Sign Up
          </Link>
        </p>
      </Card>
    </div>
  );
}