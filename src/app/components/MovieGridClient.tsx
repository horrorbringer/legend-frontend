// app/components/MovieGridClient.tsx
"use client";

import Image from "next/image";
import { Card, Button } from "@/components/ui/card";
import Link from "next/link";


interface Movie {
  id: number;
  title: string;
  type: string;
  genre: string;
  duration_minutes: number;
  poster_url: string;
}
export default function MovieGridClient({ movies }: { movies: Movie[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <Card key={movie.id}>
          <Image src={movie.poster_url} alt={movie.title} width={300} height={450} />
          <Link href={`/movies/${movie.id}`}>
            <Button>View Showtimes</Button>
          </Link>
        </Card>
      ))}
    </div>
  );
}
