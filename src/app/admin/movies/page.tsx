"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MovieForm from "@/components/admin/MovieForm";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);

  const load = async () => {
    const res = await api.get("/api/admin/movies");
    setMovies(res.data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Movies</h1>
      <MovieForm onSaved={load} />
      {movies.map((m) => (
        <Card key={m.id} className="p-4 flex justify-between items-center">
          <div>
            <h2 className="font-semibold">{m.title}</h2>
            <p>{m.genre} | {m.duration_minutes} min | {m.rating}</p>
          </div>
          <div className="flex gap-2">
            <MovieForm movie={m} onSaved={load} />
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await api.delete(`/api/admin/movies/${m.id}`);
                load();
              }}
            >
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
