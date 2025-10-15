"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingDetailsDialog } from "@/components/admin/BookingDetailsDialog";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  const load = async () => {
    const res = await api.get("/api/admin/bookings");
    setBookings(res.data.data); // paginate result
  };

  const updateStatus = async (id: number, status: string) => {
    await api.put(`/api/admin/bookings/${id}`, { status });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">🎟️ All Bookings</h1>

      <div className="grid gap-4">
        {bookings.map((b) => (
          <Card key={b.id} className="p-4 flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{b.showtime.movie.title}</h2>
              <p className="text-sm text-gray-600">
                {b.customer?.name} | {b.showtime.auditorium.name}
              </p>
              <p className="text-sm">
                {new Date(b.showtime.start_time).toLocaleString()}
              </p>
              <p className="text-sm">Total: ${b.total_price}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge>{b.status}</Badge>
              <div className="flex gap-1">
                <BookingDetailsDialog booking={b} />
                {b.status !== "paid" && (
                    <Button size="sm" onClick={() => updateStatus(b.id, "paid")}>
                    Mark Paid
                    </Button>
                )}
                {b.status !== "cancelled" && (
                    <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateStatus(b.id, "cancelled")}
                    >
                    Cancel
                    </Button>
                )}
            </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
