import MovieDetailClient from "@/components/MovieDetailClient";
import { MovieResponse } from "@/types/movies";

export default async function MovieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies/${params.id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="text-center py-10 text-red-500">
        Failed to load movie details
      </div>
    );
  }

  const data: MovieResponse = await res.json();

  console.log("Movie Detail:", data);
  return <MovieDetailClient movie={data.data} />;
}
