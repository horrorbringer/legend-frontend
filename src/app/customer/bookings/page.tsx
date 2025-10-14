"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function CustomerBookingsPage() {
  const { user, loading } = useRequireAuth("customer");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      loadBookings();
    }
  }, [loading, user]);

  const loadBookings = async () => {
    try {
      const res = await api.get("/api/customer/bookings");
      setBookings(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/api/customer/bookings/${id}/cancel`);
      alert("Booking canceled.");
      loadBookings();
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  if (loadingData) return <p className="text-center mt-10">Loading bookings...</p>;

  if (bookings.length === 0) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-500 mb-4">You have no bookings yet.</p>
        <a
          href="/movies"
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300"
        >
          Browse Movies
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-md p-6">
      <h1 className="text-2xl font-bold mb-4 text-yellow-500">🎟️ My Bookings</h1>

      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow"
          >
            <div>
              <h2 className="font-semibold text-lg">{b.movie_title ?? "Untitled Movie"}</h2>
              <p className="text-gray-500 text-sm">
                Showtime: {b.showtime_time ?? "N/A"}
              </p>
              <p className="text-sm text-gray-600">
                Total: ${b.total_price} • Status:{" "}
                <span
                  className={`font-semibold ${
                    b.status === "confirmed"
                      ? "text-green-500"
                      : b.status === "pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {b.status}
                </span>
              </p>
            </div>

            {b.status !== "canceled" && (
              <Button
                onClick={() => handleCancel(b.id)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Cancel
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
