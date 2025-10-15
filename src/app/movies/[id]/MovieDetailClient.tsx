"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MovieDetailClient({ movie }: { movie: any }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto mt-10 bg-white rounded-xl p-6 shadow-lg"
    >
      <motion.img
        src={movie.poster_url}
        alt={movie.title}
        className="rounded-lg mb-6 w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      />
      <h1 className="text-3xl font-bold">{movie.title}</h1>
      <p className="text-gray-500 mt-2">
        {movie.genre} • {movie.duration_minutes} mins • {movie.type}
      </p>
      <p className="mt-4 text-gray-700">
        {movie.description ?? "No description available."}
      </p>

      <div className="mt-6">
        <Button
          onClick={() => router.push(`/customer/book/${movie.id}`)}
          className="bg-yellow-400 text-black hover:bg-yellow-300"
        >
          🎟️ Book Now
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="font-semibold text-lg mb-2">🎬 Showtimes</h2>
        <ul className="space-y-2">
          {movie.showtimes.map((show: any) => (
            <li
              key={show.id}
              className="p-3 bg-gray-50 rounded-lg border hover:bg-yellow-50 transition"
            >
              <strong>{new Date(show.start_time).toLocaleString()}</strong> —{" "}
              {show.auditorium} ({show.cinema})
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
