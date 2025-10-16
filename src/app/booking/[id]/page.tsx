// app/booking/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Clock, Film, MapPin, Calendar, User, CreditCard, 
  Check, X, Loader2, ArrowLeft, Monitor, ChevronRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Seat {
  id: string;
  seat_row: string;
  seat_number: number;
  is_booked: boolean;
}

interface ShowtimeDetails {
  id: string;
  start_time: string;
  price: number;
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
      address: string;
      city: string;
    };
  };
  seats: Seat[];
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const showtimeId = params.id as string;

  const [showtime, setShowtime] = useState<ShowtimeDetails | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push(`/customer/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    fetchShowtimeDetails();
  }, [showtimeId, user]);

  const fetchShowtimeDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/showtimes/${showtimeId}`);
      setShowtime(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch showtime:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.is_booked) return;

    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 10) {
        alert('Maximum 10 seats per booking');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const calculateTotal = () => {
    if (!showtime) return 0;
    return showtime.price * selectedSeats.length;
  };

  const handleContinueToCheckout = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    // Store booking details in sessionStorage for checkout page
    const bookingData = {
      showtimeId: showtimeId,
      seatIds: selectedSeats.map(s => s.id),
      seats: selectedSeats.map(s => ({
        id: s.id,
        row: s.seat_row,
        number: s.seat_number
      })),
      totalPrice: calculateTotal(),
      showtime: {
        movieTitle: showtime?.movie.title,
        moviePoster: showtime?.movie.poster,
        cinemaName: showtime?.auditorium.cinema.name,
        auditoriumName: showtime?.auditorium.name,
        startTime: showtime?.start_time,
        format: showtime?.movie.format,
        duration: showtime?.movie.duration,
        genre: showtime?.movie.genre,
        rating: showtime?.movie.rating,
      }
    };

    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    router.push(`/checkout/${showtimeId}`);
  };

  const getSeatColor = (seat: Seat, isSelected: boolean) => {
    if (seat.is_booked) return 'bg-gray-700 cursor-not-allowed';
    if (isSelected) return 'bg-red-600 hover:bg-red-700';
    return 'bg-gray-600/20 hover:bg-gray-600 border-gray-600';
  };

  const groupSeatsByRow = (seats: Seat[]) => {
    const grouped = new Map<string, Seat[]>();
    seats.forEach(seat => {
      if (!grouped.has(seat.seat_row)) {
        grouped.set(seat.seat_row, []);
      }
      grouped.get(seat.seat_row)?.push(seat);
    });
    
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([row, seats]) => ({
        row,
        seats: seats.sort((a, b) => a.seat_number - b.seat_number)
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading seats...</p>
        </div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Showtime not found</p>
        </div>
      </div>
    );
  }

  const seatRows = groupSeatsByRow(showtime.seats);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent" />
        
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Movie Poster */}
            <div className="relative w-32 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-gray-950">
              <Image
                src={showtime.movie.poster}
                alt={showtime.movie.title}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>

            {/* Movie Info */}
            <div className="flex-1 space-y-3">
              <h1 className="text-3xl font-bold text-white">{showtime.movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                  {showtime.movie.format}
                </Badge>
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Film className="w-4 h-4" />
                  {showtime.movie.genre}
                </span>
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {showtime.movie.duration}
                </span>
                <span className="px-2 py-0.5 bg-yellow-600/20 text-yellow-400 rounded text-xs font-bold">
                  {showtime.movie.rating}
                </span>
              </div>

              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>
                    {showtime.auditorium.cinema.name} - {showtime.auditorium.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-6 text-sm">
                  <span>{showtime.auditorium.cinema.address}, {showtime.auditorium.cinema.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span>
                    {new Date(showtime.start_time).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>
                    {new Date(showtime.start_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Selection Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Legend */}
            <Card className="bg-gray-900/50 border-gray-800 p-4">
              <h3 className="text-white font-semibold mb-3">Seat Legend</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-600/20 border border-gray-600 rounded" />
                  <span className="text-gray-400">Available (${showtime.price})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-600 rounded" />
                  <span className="text-gray-400">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-700 rounded" />
                  <span className="text-gray-400">Booked</span>
                </div>
              </div>
            </Card>

            {/* Screen */}
            <div className="space-y-4">
              <div className="relative">
                <div className="bg-gradient-to-b from-gray-700 to-gray-900 h-3 rounded-t-full mx-auto" 
                     style={{ width: '80%' }} />
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Monitor className="w-5 h-5 text-gray-500" />
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Screen</p>
                </div>
              </div>

              {/* Seats Grid */}
              <div className="bg-gray-900/30 rounded-lg p-6 overflow-x-auto">
                <div className="space-y-3 min-w-max">
                  {seatRows.map(({ row, seats }) => (
                    <div key={row} className="flex items-center gap-2">
                      <div className="w-8 text-center">
                        <span className="text-gray-400 font-bold text-sm">{row}</span>
                      </div>
                      <div className="flex gap-2">
                        {seats.map((seat) => {
                          const isSelected = selectedSeats.find(s => s.id === seat.id);
                          return (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={seat.is_booked}
                              className={`w-8 h-8 rounded border transition-all duration-200 ${getSeatColor(
                                seat,
                                !!isSelected
                              )} ${
                                seat.is_booked 
                                  ? '' 
                                  : 'hover:scale-110 active:scale-95'
                              }`}
                              title={`${row}${seat.seat_number}`}
                            >
                              <span className="text-xs font-bold text-white">
                                {seat.is_booked ? (
                                  <X className="w-3 h-3 mx-auto" />
                                ) : isSelected ? (
                                  <Check className="w-4 h-4 mx-auto" />
                                ) : (
                                  seat.seat_number
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800 sticky top-24">
              <div className="p-6 space-y-6">
                <h3 className="text-xl font-bold text-white">Booking Summary</h3>

                {/* Selected Seats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Selected Seats</span>
                    <span className="text-white font-semibold">
                      {selectedSeats.length > 0 ? (
                        selectedSeats.map(s => `${s.seat_row}${s.seat_number}`).join(', ')
                      ) : (
                        'None'
                      )}
                    </span>
                  </div>

                  {selectedSeats.length > 0 && (
                    <>
                      <div className="border-t border-gray-800 pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {selectedSeats.length} × ${showtime.price}
                          </span>
                          <span className="text-white">
                            ${calculateTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-800 pt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-white">Total</span>
                          <span className="text-red-500">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* User Info */}
                {user && (
                  <div className="border-t border-gray-800 pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="w-4 h-4" />
                      <span>{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <CreditCard className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                )}

                {/* Continue to Checkout Button */}
                <Button
                  onClick={handleContinueToCheckout}
                  disabled={selectedSeats.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  Continue to Checkout
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Maximum 10 seats per booking
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}