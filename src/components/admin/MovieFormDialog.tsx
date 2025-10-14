"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MovieFormDialogProps {
  onSaved: () => void;
  movie?: any;
}

export function MovieFormDialog({ onSaved, movie }: MovieFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    duration_minutes: "",
    genre: "",
    rating: "",
    release_date: "",
  });

  useEffect(() => {
    if (movie) setForm(movie);
  }, [movie]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (movie) {
        await api.put(`/api/admin/movies/${movie.id}`, form);
      } else {
        await api.post(`/api/admin/movies`, form);
      }
      setOpen(false);
      onSaved();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {movie ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button>+ Add Movie</Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{movie ? "Edit Movie" : "Add Movie"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label>Title</Label>
            <Input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div>
            <Label>Duration (mins)</Label>
            <Input
              type="number"
              name="duration_minutes"
              value={form.duration_minutes}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Genre</Label>
            <Input name="genre" value={form.genre} onChange={handleChange} />
          </div>
          <div>
            <Label>Rating</Label>
            <Input name="rating" value={form.rating} onChange={handleChange} />
          </div>
          <div>
            <Label>Release Date</Label>
            <Input
              type="date"
              name="release_date"
              value={form.release_date || ""}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="w-full">
            {movie ? "Update" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
