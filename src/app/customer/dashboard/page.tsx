"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Loader2, Calendar, MapPin, Clock, AlertCircle, 
  CheckCircle, XCircle, Film, ArrowRight 
} from "lucide-react";
import Image from "next/image";

interface Movie {
  id: number;
  title: string;
  duration_minutes: number;
  rating: string;
  genre: string;
  poster_url: string;
  status: 'upcoming' | 'now_showing' | 'ended';
  format: string;
  type: string | null;
  release_date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

interface Auditorium {
  id: number;
  cinema_id: number;
  name: string;
  seat_capacity: number;
  created_at: string;
  updated_at: string;
  cinema: Cinema;
}

interface Seat {
  id: number;
  auditorium_id: number;
  seat_row: string;
  seat_number: number;
  created_at: string;
  updated_at: string;
}

interface BookingSeat {
  id: number;
  booking_id: number;
  seat_id: number;
  created_at: string | null;
  updated_at: string | null;
  seat: Seat;
}

interface Showtime {
  id: number;
  movie_id: number;
  auditorium_id: number;
  start_time: string;
  price: string;
  created_at: string;
  updated_at: string;
  movie: Movie;
  auditorium: Auditorium;
}

interface Booking {
  id: number;
  user_id: number;
  showtime_id: number;
  booking_time: string;
  total_price: string;
  status: 'pending' | 'paid' | 'cancelled';
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  showtime: Showtime;
  booking_seats: BookingSeat[];
}

export default function CustomerBookingsPage() {
  const { user, loading } = useRequireAuth("customer");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      loadBookings();
    }
  }, [loading, user]);

  const loadBookings = async () => {
    try {
      const res = await api.get("/api/bookings");
      setBookings(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };
  if(bookings.length > 0){
    console.log(bookings);
  }

  const handleCancel = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/api/bookings/${id}/cancel`);
      alert("Booking canceled.");
      loadBookings();
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Recent Bookings</h2>
            <p className="text-gray-400 mb-6">
              Ready to watch a movie? Browse our latest releases and book your perfect movie experience!
            </p>
          </div>
          <Button
            onClick={() => window.location.href = '/movies'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
          >
            Browse Movies
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Recent Bookings</h1>
        <Button
          onClick={() => window.location.href = '/bookings'}
          variant="outline"
          className="text-gray-400 border-gray-700 hover:text-white"
        >
          View All Bookings
        </Button>
      </div>

      <div className="grid gap-6">
        {bookings.slice(0, 3).map((booking) => (
          <Card key={booking.id} className="bg-gray-800/50 border-gray-700 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Movie Poster */}
              <div className="relative w-32 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-gray-900">
                  <Image
                    src={booking.showtime.movie.poster_url}
                    alt={booking.showtime.movie.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Booking Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div>
                        <h2 className="text-xl font-bold text-white mb-1">
                          {booking.showtime.movie.title}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{booking.showtime.movie.genre}</span>
                          <span>•</span>
                          <span>{booking.showtime.movie.duration_minutes} mins</span>
                          <span>•</span>
                          <span>{booking.showtime.movie.format}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          {booking.status === 'paid' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : booking.status === 'pending' ? (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className={`font-medium capitalize ${
                            booking.status === 'paid' ? 'text-green-400' :
                            booking.status === 'pending' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        {booking.payment_method && (
                          <span className="text-xs text-gray-500 capitalize">
                            via {booking.payment_method}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {booking.showtime.auditorium.cinema.name} • {booking.showtime.auditorium.cinema.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(booking.showtime.start_time).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(booking.showtime.start_time).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                          {' • '}
                          {booking.showtime.auditorium.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Seats</p>
                        <p className="text-white font-medium">
                          {booking.booking_seats
                            .map(bs => `${bs.seat.seat_row}${bs.seat.seat_number}`)
                            .join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-white">
                          ${Number(booking.total_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>                {booking.status === 'pending' && (
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => handleCancel(booking.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
