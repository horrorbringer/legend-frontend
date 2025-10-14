"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Seat {
  id: number;
  row: string;
  number: number;
  status: string; // 'available' | 'booked' | 'locked'
}

interface Props {
  showtimeId: number;
  onBooked?: (data: any) => void;
}

export default function SeatSelector({ showtimeId, onBooked }: Props) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showtime, setShowtime] = useState<any>(null);

  useEffect(() => {
    loadSeats();
  }, [showtimeId]);

  const loadSeats = async () => {
    const res = await api.get(`/api/customer/showtimes/${showtimeId}`);
    setShowtime(res.data);
    setSeats(res.data.auditorium?.seats || []);
  };

  const toggleSeat = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleBooking = async () => {
    if (!selected.length) return alert("Please select at least one seat");
    setLoading(true);
    try {
      const payload = {
        customer_name: "Guest",
        customer_phone: "012345678",
        showtime_id: showtimeId,
        seat_ids: selected,
      };
      const res = await api.post("/api/customer/bookings", payload);
      alert("🎟 Booking successful! ID: " + res.data.booking_id);
      setSelected([]);
      onBooked?.(res.data);
    } catch (e) {
      alert("Booking failed. Check console.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Select your seats</h2>
      <div className="grid grid-cols-8 gap-3">
        {seats.map((seat) => (
          <Card
            key={seat.id}
            onClick={() =>
              seat.status === "available" ? toggleSeat(seat.id) : null
            }
            className={`p-3 text-center cursor-pointer transition ${
              seat.status === "booked"
                ? "bg-gray-300 cursor-not-allowed"
                : selected.includes(seat.id)
                ? "bg-green-500 text-white"
                : "bg-white hover:bg-green-100"
            }`}
          >
            {seat.row}
            {seat.number}
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <p>
          Selected Seats: 
          <strong>{selected.length}</strong> × $
          {showtime?.price || 0} = 
          <strong>${(selected.length * (showtime?.price || 0)).toFixed(2)}</strong>
        </p>
        <Button disabled={loading} onClick={handleBooking}>
          {loading ? "Booking…" : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
}
