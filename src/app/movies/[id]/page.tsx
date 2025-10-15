"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function MovieDetailPage() {
  alert("This page is under construction. Please book directly from the movies list.");
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);

  useEffect(() => {
    api.get(`/api/movies/${id}`).then((res) => setMovie(res.data.data));
  }, [id]);

  console.log(movie);

  if (!movie) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-xl p-6 shadow-lg">
      <Image src={movie.poster_url} alt={movie.title} className="rounded-lg mb-6" />
      <h1 className="text-3xl font-bold">{movie.title}</h1>
      <p className="text-gray-500 mt-2">
        {movie.genre} • {movie.duration_minutes} mins • {movie.type}
      </p>
      <p className="mt-4">{movie.description ?? "No description available."}</p>

      <div className="mt-6">
        <Button
          onClick={() => router.push(`/customer/book/${movie.id}`)}
          className="bg-yellow-400 text-black hover:bg-yellow-300"
        >
          🎟️ Book Now
        </Button>
      </div>
    </div>
  );
}
