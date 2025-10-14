"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/lib/api";

export function BookingDetailsDialog({ booking }: { booking: any }) {
  const [details, setDetails] = useState<any | null>(null);

  const loadDetails = async () => {
    const res = await api.get(`/api/admin/bookings/${booking.id}`);
    setDetails(res.data);
  };

  return (
    <Dialog onOpenChange={(open) => open && loadDetails()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Booking #{booking.id}</DialogTitle>
        </DialogHeader>

        {details ? (
          <div className="space-y-4">
            {/* Movie & Showtime Info */}
            <div>
              <h2 className="text-lg font-semibold">{details.showtime.movie.title}</h2>
              <p className="text-sm text-gray-600">
                {new Date(details.showtime.start_time).toLocaleString()} — {details.showtime.auditorium.name}
              </p>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold">Customer</h3>
              <p className="text-sm">{details.customer?.name}</p>
              <p className="text-sm">{details.customer?.email}</p>
            </div>

            {/* Seats */}
            <div>
              <h3 className="font-semibold">Seats</h3>
              <div className="flex flex-wrap gap-2">
                {details.seats.map((s: any) => (
                  <Badge key={s.id} variant="secondary">
                    {s.row}{s.number}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t pt-3">
              <p>Status: <Badge>{details.status}</Badge></p>
              <p>Total Price: ${details.total_price}</p>
              <p>Created: {new Date(details.created_at).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <p>Loading booking details...</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
