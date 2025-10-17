"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/lib/api";

export function BookingDetailsDialog({ 
  bookingId,
  onClose,
  onStatusUpdate 
}: { 
  bookingId: number;
  onClose: () => void;
  onStatusUpdate: () => void;
}) {
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDetails = async () => {
    try {
      const res = await api.get(`/api/admin/bookings/${bookingId}`);
      setDetails(res.data);
    } catch (error) {
      console.error("Failed to load booking details:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Booking #{bookingId}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : details ? (
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
          <p>Could not load booking details</p>
        )}

        {details && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            {details.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await api.patch(`/api/admin/bookings/${bookingId}/status`, {
                        status: 'cancelled'
                      });
                      onStatusUpdate();
                      onClose();
                    } catch (error) {
                      console.error("Failed to update booking status:", error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Cancel Booking
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await api.patch(`/api/admin/bookings/${bookingId}/status`, {
                        status: 'confirmed'
                      });
                      onStatusUpdate();
                      onClose();
                    } catch (error) {
                      console.error("Failed to update booking status:", error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Confirm Booking
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
