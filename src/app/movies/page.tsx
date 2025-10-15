"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  useEffect(() => {
    api.get("/api/movies").then((r) => setMovies(r.data.data));
  }, []);

console.log(movies);

  return (
    <div className="grid grid-cols-3 gap-4">
      {movies.map((m) => (
        <Link key={m.id} href={`/showtimes/${m.showtimes?.[0]?.id || ""}`}>
          <Card className="p-4 cursor-pointer hover:bg-gray-50">
            <h3 className="font-semibold">{m.title}</h3>
            <p className="text-sm text-gray-500">
              {m.duration} min • {m.genre}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
