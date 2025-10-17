"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Users,
  Film,
  Building2,
  Clock,
  Ticket,
  TrendingUp,
  DollarSign,
  Calendar,
  CalendarDays,
  CheckCircle,
  XCircle,
  QrCode,
  CreditCard
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface DashboardResponse {
  totalUsers: number;
  totalMovies: number;
  nowShowingMovies: number;
  upcomingMovies: number;
  totalCinemas: number;
  totalAuditoriums: number;
  totalShowtimes: number;
  activeShowtimes: number;
  upcomingShowtimes: number;
  uniqueMoviesShowing: number;
  bookings: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  payments: {
    khqr: number;
    aba: number;
  };
  revenue: {
    today: {
      amount: string;
      growth: { value: number; type: 'increase' | 'decrease' | 'neutral' };
    };
    monthly: {
      amount: string;
      growth: { value: number; type: 'increase' | 'decrease' | 'neutral' };
    };
  };
  lastUpdated: string;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  change,
  loading = false,
  subtitle,
  className = "",
}: { 
  title: string;
  value: string | number;
  icon: any;
  change?: { value: number; type: 'increase' | 'decrease' | 'neutral' };
  loading?: boolean;
  subtitle?: string;
  className?: string;
}) {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-400';
      case 'decrease':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return '↑';
      case 'decrease':
        return '↓';
      default:
        return '•';
    }
  };

  return (
    <Card className={cn("p-6 bg-gray-800/50 border-gray-700", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          {loading ? (
            <div className="h-8 w-24 animate-pulse bg-gray-700 rounded"></div>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white">{value}</h3>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </>
          )}
          {change && !loading && (
            <p className={cn(
              "text-sm",
              getChangeColor(change.type)
            )}>
              {getChangeIcon(change.type)} {change.value}%
            </p>
          )}
        </div>
        <div className="p-3 bg-gray-700/50 rounded-full">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminHome() {
  const [stats, setStats] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/api/admin/dashboard/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">
            Last updated: {stats ? new Date(stats.lastUpdated).toLocaleString() : 'Loading...'}
          </p>
        </div>
        <Button
          onClick={loadStats}
          variant="outline"
          className="text-gray-400 border-gray-700 hover:text-white"
        >
          Refresh Stats
        </Button>
      </div>

      {/* Revenue Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={`$${stats?.revenue.today.amount ?? '0.00'}`}
          icon={TrendingUp}
          change={stats?.revenue.today.growth}
          loading={loading}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats?.revenue.monthly.amount ?? '0.00'}`}
          icon={DollarSign}
          change={stats?.revenue.monthly.growth}
          loading={loading}
        />
        <StatCard
          title="KHQR Payments"
          value={stats?.payments.khqr ?? 0}
          icon={QrCode}
          loading={loading}
        />
        <StatCard
          title="ABA Payments"
          value={stats?.payments.aba ?? 0}
          icon={CreditCard}
          loading={loading}
        />
      </div>

      {/* Movies & Showtimes Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Now Showing"
          value={stats?.nowShowingMovies ?? 0}
          icon={Film}
          loading={loading}
          subtitle={`${stats?.uniqueMoviesShowing ?? 0} unique movies`}
        />
        <StatCard
          title="Upcoming Movies"
          value={stats?.upcomingMovies ?? 0}
          icon={Clock}
          loading={loading}
        />
        <StatCard
          title="Active Showtimes"
          value={stats?.activeShowtimes ?? 0}
          icon={Calendar}
          loading={loading}
        />
        <StatCard
          title="Upcoming Showtimes"
          value={stats?.upcomingShowtimes ?? 0}
          icon={CalendarDays}
          loading={loading}
        />
      </div>

      {/* Bookings Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats?.bookings.total ?? 0}
          icon={Ticket}
          loading={loading}
        />
        <StatCard
          title="Pending Bookings"
          value={stats?.bookings.pending ?? 0}
          icon={Clock}
          loading={loading}
          className="border-l-yellow-500 border-l-4"
        />
        <StatCard
          title="Completed Bookings"
          value={stats?.bookings.completed ?? 0}
          icon={CheckCircle}
          loading={loading}
          className="border-l-green-500 border-l-4"
        />
        <StatCard
          title="Cancelled Bookings"
          value={stats?.bookings.cancelled ?? 0}
          icon={XCircle}
          loading={loading}
          className="border-l-red-500 border-l-4"
        />
      </div>

      {/* Infrastructure Section */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Total Cinemas"
          value={stats?.totalCinemas ?? 0}
          icon={Building2}
          loading={loading}
          subtitle={`${stats?.totalAuditoriums ?? 0} auditoriums`}
        />
        <StatCard
          title="Total Movies"
          value={stats?.totalMovies ?? 0}
          icon={Film}
          loading={loading}
        />
      </div>
    </div>
  );
}
