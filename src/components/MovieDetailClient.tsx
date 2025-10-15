"use client";

import { Movie } from "@/types/movies";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MovieDetailClient({ movie }: { movie: Movie }) {
  const router = useRouter();

  return (
    <motion.div
      className="max-w-5xl mx-auto mt-10 bg-white rounded-3xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Poster */}
        <div className="relative h-[500px]">
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <div className="p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{movie.title}</h1>
            <p className="text-gray-500 mt-2">
              {movie.genre} • {movie.duration} • {movie.type} • Rated {movie.rating}
            </p>

            <p className="mt-4 text-gray-700">
              Released on:{" "}
              <span className="font-medium text-gray-900">
                {movie.release_date}
              </span>
            </p>
          </div>

          {/* Showtimes */}
          <div className="mt-6 space-y-4">
            {movie.showtimes.length > 0 ? (
              movie.showtimes.map((group, i) => (
                <div key={i} className="border-t pt-4">
                  <h3 className="font-semibold text-lg text-gray-800">
                    🎬 {group.cinema}
                  </h3>
                  <p className="text-gray-500 mb-2">{group.auditorium}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.times.map((t, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/customer/book/${movie.id}?time=${t}`)}
                      >
                        {new Date(t).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No showtimes available.</p>
            )}
          </div>

          <div className="mt-8">
            <Button
              onClick={() => router.push(`/customer/book/${movie.id}`)}
              className="w-full bg-yellow-400 text-black font-semibold text-lg hover:bg-yellow-300"
            >
              🎟️ Book Now
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
