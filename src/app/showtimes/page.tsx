// app/showtimes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, Calendar, Film, ChevronRight, Armchair, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Showtime {
  id: string;
  start_time: string;
  movie: {
    id: string;
    title: string;
    poster: string;
    duration: string;
    genre: string;
    rating: string;
    format: string;
  };
  auditorium: {
    name: string;
    cinema: {
      name: string;
      location: string;
    };
  };
  available_seats: number;
  total_seats: number;
  price: number;
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric' 
  });
}

function groupShowtimesByDate(showtimes: Showtime[]) {
  const grouped = new Map<string, Showtime[]>();
  
  showtimes.forEach(showtime => {
    const date = new Date(showtime.start_time).toDateString();
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)?.push(showtime);
  });
  
  return Array.from(grouped.entries()).map(([date, times]) => ({
    date,
    showtimes: times.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    )
  }));
}

function groupShowtimesByMovie(showtimes: Showtime[]) {
  const grouped = new Map<string, Showtime[]>();
  
  showtimes.forEach(showtime => {
    const movieId = showtime.movie.id;
    if (!grouped.has(movieId)) {
      grouped.set(movieId, []);
    }
    grouped.get(movieId)?.push(showtime);
  });
  
  return Array.from(grouped.entries()).map(([movieId, times]) => ({
    movie: times[0].movie,
    showtimes: groupShowtimesByDate(times)
  }));
}

export default function ShowtimesPage() {
  const searchParams = useSearchParams();
  const movieId = searchParams.get('movie');
  
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowtimes = async () => {
      setLoading(true);
      try {
        const url = movieId 
          ? `/api/showtimes?movie=${movieId}`
          : '/api/showtimes';
        const response = await api.get(url);
        setShowtimes(response.data.data || response.data);
      } catch (error) {
        console.error('Failed to fetch showtimes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId]);

  const groupedByMovie = groupShowtimesByMovie(showtimes);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading showtimes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <Clock className="w-8 h-8 text-red-600" />
              <div className="absolute inset-0 bg-red-600/30 blur-xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">
              {movieId ? 'Movie ' : 'All '}
              <span className="text-red-600">Showtimes</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Select your preferred showtime and book your seats
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {groupedByMovie.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <Clock className="w-20 h-20 mx-auto text-gray-700 mb-6" />
              <div className="absolute inset-0 bg-red-600/20 blur-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Showtimes Available</h3>
            <p className="text-gray-400 text-lg mb-6">Check back later for upcoming shows</p>
            <Link href="/movies">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">
                Browse Movies
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedByMovie.map(({ movie, showtimes: dateGroups }) => (
              <div key={movie.id} className="space-y-6">
                {/* Movie Header */}
                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row gap-6 p-6">
                    {/* Poster */}
                    <div className="relative w-full sm:w-32 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-gray-950">
                      <Image
                        src={movie.poster}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{movie.title}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                          <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                            {movie.format}
                          </Badge>
                          <span className="flex items-center gap-1.5">
                            <Film className="w-4 h-4" />
                            {movie.genre}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {movie.duration}
                          </span>
                          <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 rounded text-xs font-bold">
                            {movie.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Showtimes by Date */}
                <div className="space-y-6">
                  {dateGroups.map(({ date, showtimes }) => (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-red-600" />
                        <h3 className="text-xl font-bold text-white">
                          {formatDate(showtimes[0].start_time)}
                        </h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-800 to-transparent" />
                      </div>

                      {/* Showtime Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {showtimes.map((showtime) => {
                          const occupancyPercent = ((showtime.total_seats - showtime.available_seats) / showtime.total_seats) * 100;
                          const isAlmostFull = showtime.available_seats < 10;
                          
                          return (
                            <Link key={showtime.id} href={`/booking/${showtime.id}`}>
                              <Card className="group bg-gray-900/50 border-gray-800 hover:border-red-600/50 hover:shadow-lg hover:shadow-red-600/20 transition-all duration-300 cursor-pointer">
                                <div className="p-5 space-y-4">
                                  {/* Cinema Info */}
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2 text-gray-300">
                                        <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                                        <span className="font-semibold text-sm">
                                          {showtime.auditorium.cinema.name}
                                        </span>
                                      </div>
                                      <Badge className="bg-gray-800 text-gray-400 text-xs">
                                        {showtime.auditorium.name}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-6">
                                      {showtime.auditorium.cinema.location}
                                    </p>
                                  </div>

                                  {/* Time & Price */}
                                  <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-5 h-5 text-red-600" />
                                      <span className="text-2xl font-bold text-white">
                                        {formatTime(showtime.start_time)}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-gray-500">From</p>
                                      <p className="text-xl font-bold text-red-500">
                                        ${showtime.price}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Seats Info */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <Armchair className="w-4 h-4" />
                                        <span>
                                          {showtime.available_seats} seats available
                                        </span>
                                      </div>
                                      {isAlmostFull && (
                                        <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/30 text-xs">
                                          Filling Fast
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Occupancy Bar */}
                                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-300 ${
                                          occupancyPercent > 80 
                                            ? 'bg-orange-500' 
                                            : 'bg-red-600'
                                        }`}
                                        style={{ width: `${occupancyPercent}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Book Button */}
                                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold group-hover:bg-red-700 transition-colors">
                                    Select Seats
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                  </Button>
                                </div>
                              </Card>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}