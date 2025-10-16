// app/payment/khqr/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  CheckCircle, Loader2, Clock, AlertCircle, ArrowLeft,
  Smartphone, Copy, Check
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface BookingDetails {
  id: string;
  booking_time: string;
  total_price: number;
  status: string;
  payment_method: string;
  showtime: {
    start_time: string;
    movie: {
      title: string;
      poster_url: string;
    };
    auditorium: {
      name: string;
      cinema: {
        name: string;
      };
    };
  };
  booking_seats: Array<{
    seat: {
      seat_row: string;
      seat_number: number;
    };
  }>;
}

export default function KHQRPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes

  useEffect(() => {
    if (!user) {
      router.push('/customer/login');
      return;
    }
    fetchBookingDetails();
  }, [bookingId, user]);

  useEffect(() => {
    if (booking?.status === 'paid') {
      router.push(`/customer/bookings/${bookingId}`);
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto check payment status every 10 seconds
    const checker = setInterval(() => {
      checkPaymentStatus();
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(checker);
    };
  }, [booking]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      setBooking(response.data.data);
      
      if (response.data.data.status === 'paid') {
        router.push(`/customer/bookings/${bookingId}`);
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (checking) return;
    
    setChecking(true);
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      if (response.data.data.status === 'paid') {
        router.push(`/customer/bookings/${bookingId}`);
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleExpired = async () => {
    try {
      await api.post(`/api/bookings/${bookingId}/cancel`);
      alert('Payment timeout. Booking has been cancelled.');
      router.push('/movies');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Booking not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent" />
        
        <div className="relative max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/movies')}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel Payment
          </Button>

          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl md:text-4xl font-black text-white">
              KHQR <span className="text-blue-500">Payment</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Timer Warning */}
        <div className={`mb-6 p-4 rounded-lg border ${
          countdown < 120 
            ? 'bg-red-600/10 border-red-600/30' 
            : 'bg-blue-600/10 border-blue-600/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${countdown < 120 ? 'text-red-400' : 'text-blue-400'}`} />
              <span className={`font-semibold ${countdown < 120 ? 'text-red-300' : 'text-blue-300'}`}>
                Complete payment within: {formatTime(countdown)}
              </span>
            </div>
            {checking && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <Card className="bg-gray-900/50 border-gray-800 p-8">
            <div className="text-center space-y-6">
              <h2 className="text-xl font-bold text-white">Scan QR Code</h2>
              
              {/* QR Code Placeholder */}
              <div className="bg-white p-6 rounded-xl mx-auto" style={{ width: 'fit-content' }}>
                <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                  {/* Replace with actual QR code generator */}
                  <div className="text-center text-gray-600">
                    <Smartphone className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">QR Code</p>
                    <p className="text-xs">Booking #{bookingId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-gray-400 text-sm">
                  Scan this QR code with any banking app that supports KHQR
                </p>
                
                {/* Reference Number */}
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-xs mb-2">Reference Number</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-white font-mono">{bookingId}</code>
                    <button
                      onClick={() => copyToClipboard(bookingId)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-600/10 p-4 rounded-lg border border-blue-600/30">
                  <p className="text-2xl font-bold text-blue-400">
                    ${booking.total_price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Booking Details</h3>
              
              <div className="space-y-4">
                {/* Movie Info */}
                <div className="flex gap-4">
                  <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-gray-950">
                    <Image
                      src={booking.showtime.movie.poster_url}
                      alt={booking.showtime.movie.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm mb-1">
                      {booking.showtime.movie.title}
                    </h4>
                    <p className="text-gray-400 text-xs">
                      {booking.showtime.auditorium.cinema.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {booking.showtime.auditorium.name}
                    </p>
                  </div>
                </div>

                {/* Showtime */}
                <div className="border-t border-gray-800 pt-3">
                  <p className="text-gray-400 text-xs mb-1">Showtime</p>
                  <p className="text-white text-sm">
                    {new Date(booking.showtime.start_time).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Seats */}
                <div className="border-t border-gray-800 pt-3">
                  <p className="text-gray-400 text-xs mb-1">Seats</p>
                  <p className="text-white text-sm">
                    {booking.booking_seats
                      .map(bs => `${bs.seat.seat_row}${bs.seat.seat_number}`)
                      .join(', ')}
                  </p>
                </div>

                {/* Total */}
                <div className="border-t border-gray-800 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-xl font-bold text-blue-500">
                      ${booking.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Payment Instructions</h3>
              <ol className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </span>
                  <span>Open your banking app that supports KHQR</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </span>
                  <span>Scan the QR code above</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </span>
                  <span>Verify the amount and complete the payment</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    4
                  </span>
                  <span>Wait for confirmation (usually instant)</span>
                </li>
              </ol>
            </Card>

            <Button
              onClick={checkPaymentStatus}
              disabled={checking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
            >
              {checking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I've Completed Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}