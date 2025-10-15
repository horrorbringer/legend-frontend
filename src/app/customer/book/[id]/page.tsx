// app/movies/[id]/page.tsx
import { api } from "@/lib/api";
import BookMovieClient from "./BookMovieClient";

export default async function BookMoviePage({ params }: { params: { id: string } }) {
  // Fetch data directly from your Laravel API
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${params.id}`, {
    cache: "no-store", // ensure fresh data
  });

  if (!res.ok) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Failed to load movie data.
      </div>
    );
  }

  const movie = await res.json();

  return (
    <div className="max-w-3xl mx-auto py-10">
      <BookMovieClient movie={movie} />
    </div>
  );
}
