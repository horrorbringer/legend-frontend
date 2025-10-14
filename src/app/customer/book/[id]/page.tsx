"use client";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BookMoviePage() {
  const { id } = useParams();
  const { user, loading } = useRequireAuth("customer");
  const [movie, setMovie] = useState<any>(null);
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (id) {
      api.get(`/api/movies/${id}`).then((res) => setMovie(res.data));
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!movie) return <p>Loading movie info...</p>;

  const handleBooking = async () => {
    try {
      const response = await api.post("/api/customer/bookings", {
        movie_id: movie.id,
        seats,
      });
      setMessage("Booking successful!");
      setTimeout(() => router.push("/customer/bookings"), 1500);
    } catch (err: any) {
      setMessage("Booking failed. Please try again.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white rounded-xl p-6 shadow-lg">
      <img src={movie.poster_url} alt={movie.title} className="rounded-md mb-4" />
      <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
      <p className="text-gray-600 mb-4">{movie.genre} • {movie.duration_minutes} mins</p>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Number of Seats</label>
        <Input
          type="number"
          min="1"
          max="10"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
        />

        <Button onClick={handleBooking} className="w-full bg-yellow-400 text-black hover:bg-yellow-300">
          Confirm Booking
        </Button>

        {message && <p className="text-center mt-3 text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
}
