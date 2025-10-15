"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShowtimeFormDialog } from "@/components/admin/ShowtimeFormDialog";

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState<any[]>([]);

  const fetchShowtimes = async () => {
    const res = await api.get("/api/admin/showtimes");
    setShowtimes(res.data);
  };

  const deleteShowtime = async (id: number) => {
    if (confirm("Are you sure you want to delete this showtime?")) {
      await api.delete(`/api/admin/showtimes/${id}`);
      fetchShowtimes();
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">🎥 Showtimes</h1>
        <ShowtimeFormDialog onSaved={fetchShowtimes} />
      </div>

      <div className="grid gap-4">
        {showtimes.map((st) => (
          <Card key={st.id} className="p-4 flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{st.movie?.title}</h2>
              <p>{st.auditorium?.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(st.start_time).toLocaleString()} →{" "}
                {new Date(st.end_time).toLocaleString()}
              </p>
              <p className="text-sm font-medium">💲{st.price}</p>
            </div>
            <div className="flex gap-2">
              <ShowtimeFormDialog showtime={st} onSaved={fetchShowtimes} />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteShowtime(st.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
