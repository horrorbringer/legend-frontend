"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { BookingsFilters, BookingsFilterValues } from "@/components/admin/BookingsFilters";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { BookingListResponse } from "@/types/bookings";
import { BookingDetailsDialog } from "@/components/admin/BookingDetailsDialog";

export default function AdminBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BookingListResponse | null>(null);
  const [filters, setFilters] = useState<BookingsFilterValues>({});
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  useEffect(() => {
    loadBookings(filters);
  }, [filters]);

  const loadBookings = async (filters: BookingsFilterValues) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const res = await api.get(`/api/admin/bookings?${params.toString()}`);
      setData(res.data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters: BookingsFilterValues) => {
    setFilters(newFilters);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Bookings</h1>
        <p className="text-gray-400 mt-1">Manage and monitor all customer bookings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <p className="text-sm font-medium text-gray-400">Total Bookings</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {data?.summary.total_bookings ?? 0}
          </h3>
        </Card>
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <p className="text-sm font-medium text-gray-400">Total Revenue</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            ${Number(data?.summary.total_revenue).toFixed(2) ?? '0.00'}
          </h3>
        </Card>
        <Card className="p-6 bg-gray-800/50 border-gray-700border-l-4 border-l-yellow-500">
          <p className="text-sm font-medium text-gray-400">Pending Bookings</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {data?.summary.pending_bookings ?? 0}
          </h3>
        </Card>
        <Card className="p-6 bg-gray-800/50 border-gray-700">
          <p className="text-sm font-medium text-gray-400">Payment Methods</p>
          <div className="mt-2 space-y-1">
            {data?.summary.payment_methods.map(pm => (
              <div key={pm.payment_method} className="flex justify-between">
                <span className="text-gray-400 capitalize">{pm.payment_method}</span>
                <span className="text-white font-medium">{pm.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <BookingsFilters onFilter={handleFilter} />

      {/* Bookings Table */}
      {data && (
        <BookingsTable
          bookings={data.bookings.data}
          onViewDetails={setSelectedBookingId}
        />
      )}

      {/* Booking Details Dialog */}
      {selectedBookingId && (
        <BookingDetailsDialog
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onStatusUpdate={() => loadBookings(filters)}
        />
      )}
    </div>
  );
}