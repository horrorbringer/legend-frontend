"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/customer/bookings").then((res) => setBookings(res.data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">My Bookings</h1>

      {bookings.map((b) => (
        <Link
          key={b.id}
          href={`/bookings/${b.id}`}
          className="block p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex justify-between">
            <div>
              <h2 className="font-semibold">
                {b.showtime.movie.title}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(b.showtime.start_time).toLocaleString()} – 
                {b.showtime.auditorium.name}
              </p>
            </div>
            <Badge
              variant={
                b.status === "paid"
                  ? "success"
                  : b.status === "cancelled"
                  ? "destructive"
                  : "secondary"
              }
            >
              {b.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm">
            Total Price: ${b.total_price}
          </p>
        </Link>
      ))}
    </div>
  );
}
