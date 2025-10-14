"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);

  const load = async () => {
    const res = await api.get(`/api/customer/bookings/${id}`);
    setBooking(res.data);
  };

  const cancelBooking = async () => {
    if (confirm("Cancel this booking?")) {
      await api.patch(`/api/customer/bookings/${id}/cancel`);
      await load();
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!booking) return <p>Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">
        {booking.showtime.movie.title}
      </h1>
      <p>{new Date(booking.showtime.start_time).toLocaleString()}</p>

      <div className="flex justify-between items-center">
        <Badge>{booking.status}</Badge>
        {booking.status === "pending" && (
          <Button variant="destructive" onClick={cancelBooking}>
            Cancel Booking
          </Button>
        )}
      </div>

      <div className="mt-4">
        <h2 className="font-semibold mb-2">Seats</h2>
        <div className="grid grid-cols-6 gap-2">
          {booking.seats.map((s: any) => (
            <div key={s.id} className="border p-2 rounded text-center">
              {s.seat_row}
              {s.seat_number}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 font-semibold">
        Total: ${booking.total_price}
      </p>
    </div>
  );
}
