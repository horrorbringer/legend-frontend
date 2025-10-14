"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/lib/api";

export default function MovieForm({ movie, onSaved }: { movie?: any; onSaved?: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: movie?.title || "",
    duration_minutes: movie?.duration_minutes || "",
    rating: movie?.rating || "",
    genre: movie?.genre || "",
    release_date: movie?.release_date || "",
  });

  const save = async () => {
    if (movie) {
      await api.put(`/api/admin/movies/${movie.id}`, form);
    } else {
      await api.post("/api/admin/movies", form);
    }
    setOpen(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{movie ? "Edit" : "Add Movie"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle>{movie ? "Edit Movie" : "Add Movie"}</DialogTitle>
        </DialogHeader>

        <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border p-2 rounded"/>
        <input type="number" placeholder="Duration (min)" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: Number(e.target.value)})} className="w-full border p-2 rounded"/>
        <input placeholder="Genre" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} className="w-full border p-2 rounded"/>
        <input placeholder="Rating" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="w-full border p-2 rounded"/>
        <input type="date" placeholder="Release Date" value={form.release_date} onChange={e => setForm({...form, release_date: e.target.value})} className="w-full border p-2 rounded"/>

        <Button onClick={save}>{movie ? "Update" : "Create"}</Button>
      </DialogContent>
    </Dialog>
  );
}
