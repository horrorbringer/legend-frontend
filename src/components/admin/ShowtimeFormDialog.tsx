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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ShowtimeFormDialogProps {
  onSaved: () => void;
  showtime?: any;
}

export function ShowtimeFormDialog({ onSaved, showtime }: ShowtimeFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [movies, setMovies] = useState<any[]>([]);
  const [auditoriums, setAuditoriums] = useState<any[]>([]);
  const [form, setForm] = useState({
    movie_id: "",
    auditorium_id: "",
    start_time: "",
    end_time: "",
    price: "",
  });

  useEffect(() => {
    fetchData();
    if (showtime) setForm(showtime);
  }, [showtime]);

  const fetchData = async () => {
    const [movieRes, audRes] = await Promise.all([
      api.get("/api/admin/movies"),
      api.get("/api/admin/auditoriums"),
    ]);
    setMovies(movieRes.data);
    setAuditoriums(audRes.data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (showtime) {
        await api.put(`/api/admin/showtimes/${showtime.id}`, form);
      } else {
        await api.post(`/api/admin/showtimes`, form);
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
        {showtime ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button>+ Add Showtime</Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{showtime ? "Edit Showtime" : "Add Showtime"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label>Movie</Label>
            <Select
              value={form.movie_id?.toString() || ""}
              onValueChange={(val) => setForm({ ...form, movie_id: val })}
            >
              <SelectTrigger><SelectValue placeholder="Select movie" /></SelectTrigger>
              <SelectContent>
                {movies.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Auditorium</Label>
            <Select
              value={form.auditorium_id?.toString() || ""}
              onValueChange={(val) => setForm({ ...form, auditorium_id: val })}
            >
              <SelectTrigger><SelectValue placeholder="Select auditorium" /></SelectTrigger>
              <SelectContent>
                {auditoriums.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Start Time</Label>
            <Input
              type="datetime-local"
              name="start_time"
              value={form.start_time || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>End Time</Label>
            <Input
              type="datetime-local"
              name="end_time"
              value={form.end_time || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Price ($)</Label>
            <Input
              type="number"
              name="price"
              value={form.price || ""}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {showtime ? "Update" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
