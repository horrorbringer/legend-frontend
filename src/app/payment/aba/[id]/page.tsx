// app/payment/aba/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  CheckCircle, Loader2, Clock, ArrowLeft, Building, Copy, Check
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

export default function ABAPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes

  // ABA Payment details (replace with actual merchant info)
  const abaDetails = {
    accountName: "Cinema Booking System",
    accountNumber: "000123456",
    reference: bookingId,
  };

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
      const response = await api.get(`/api/customer/bookings/${bookingId}`);
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
      const response = await api.get(`/api/customer/bookings/${bookingId}`);
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
      await api.post(`/api/customer/bookings/${bookingId}/cancel`);
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
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent" />
        
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
            <Building className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-black text-white">
              ABA <span className="text-red-600">Payment</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Timer Warning */}
        <div className={`mb-6 p-4 rounded-lg border ${
          countdown < 120 
            ? 'bg-red-600/10 border-red-600/30' 
            : 'bg-red-600/10 border-red-600/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${countdown < 120 ? 'text-red-400' : 'text-red-400'}`} />
              <span className={`font-semibold ${countdown < 120 ? 'text-red-300' : 'text-red-300'}`}>
                Complete payment within: {formatTime(countdown)}
              </span>
            </div>
            {checking && <Loader2 className="w-4 h-4 text-red-400 animate-spin" />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Details Section */}
          <Card className="bg-gray-900/50 border-gray-800 p-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white text-center">ABA Bank Transfer</h2>
              
              {/* Account Details */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-xs mb-2">Account Name</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-semibold">{abaDetails.accountName}</p>
                    <button
                      onClick={() => copyToClipboard(abaDetails.accountName)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-xs mb-2">Account Number</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-white font-mono text-lg">{abaDetails.accountNumber}</code>
                    <button
                      onClick={() => copyToClipboard(abaDetails.accountNumber)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-400 text-xs mb-2">Reference Number (IMPORTANT)</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-white font-mono">{abaDetails.reference}</code>
                    <button
                      onClick={() => copyToClipboard(abaDetails.reference)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-red-600/10 p-4 rounded-lg border border-red-600/30">
                  <p className="text-gray-400 text-xs mb-1">Amount to Pay</p>
                  <p className="text-3xl font-bold text-red-400">
                    ${booking.total_price}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-600/10 p-4 rounded-lg border border-yellow-600/30">
                <p className="text-yellow-300 text-sm font-semibold mb-1">⚠️ Important</p>
                <p className="text-yellow-200 text-xs">
                  Please include the reference number in your transfer description for automatic confirmation.
                </p>
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
                    <span className="text-xl font-bold text-red-500">
                      ${booking.total_price}
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
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </span>
                  <span>Open your ABA Mobile app</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </span>
                  <span>Select "Transfer" or "Pay"</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </span>
                  <span>Enter the account number and amount shown above</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    4
                  </span>
                  <span><strong>IMPORTANT:</strong> Add reference number in description</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    5
                  </span>
                  <span>Complete the transfer and wait for confirmation</span>
                </li>
              </ol>
            </Card>

            <Button
              onClick={checkPaymentStatus}
              disabled={checking}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
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