"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SeatSelector from "@/components/customer/SeatSelector";

export default function ShowtimeDetailPage() {
  const { id } = useParams();
  const [showtime, setShowtime] = useState<any>(null);

  useEffect(() => {
    fetchShowtime();
  }, [id]);

  const fetchShowtime = async () => {
    const res = await api.get(`/api/showtimes/${id}`);
    setShowtime(res.data);
  };

  if (!showtime) return <p>Loading…</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">{showtime.movie?.title}</h1>
      <p>{new Date(showtime.start_time).toLocaleString()}</p>
      <SeatSelector showtimeId={Number(id)} />
    </div>
  );
}
