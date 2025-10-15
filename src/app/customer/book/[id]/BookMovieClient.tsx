"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration_minutes: number;
  poster_url: string;
}

export default function BookMovieClient({ movie }: { movie: Movie }) {
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBooking = async () => {
    try {
      setLoading(true);
      const response = await api.post("/api/customer/bookings", {
        movie_id: movie.id,
        seats,
      });
      setMessage("✅ Booking successful!");
      setTimeout(() => router.push("/customer/bookings"), 1500);
    } catch (err: any) {
      setMessage("❌ Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-6 rounded-2xl shadow-md"
    >
      <img
        src={movie.poster_url}
        alt={movie.title}
        className="rounded-xl w-full h-80 object-cover mb-4"
      />

      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
      <p className="text-gray-500 mb-6">
        {movie.genre} • {movie.duration_minutes} mins
      </p>

      <div className="space-y-4">
        <label className="text-sm font-semibold text-gray-700">
          🎟 Number of Seats
        </label>
        <Input
          type="number"
          min={1}
          max={10}
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="border-gray-300"
        />

        <Button
          onClick={handleBooking}
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded-lg transition"
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </Button>

        {message && (
          <p
            className={`text-center mt-3 text-sm ${
              message.includes("✅") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </motion.div>
  );
}
