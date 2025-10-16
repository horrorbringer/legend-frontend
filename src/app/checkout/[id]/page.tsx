// app/checkout/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Clock, MapPin, Calendar, CreditCard, 
  ArrowLeft, Check, Loader2, Shield, Smartphone, Building
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface BookingData {
  showtimeId: string;
  seatIds: string[];
  seats: Array<{
    id: string;
    row: string;
    number: number;
  }>;
  totalPrice: number;
  showtime: {
    movieTitle: string;
    moviePoster: string;
    cinemaName: string;
    auditoriumName: string;
    startTime: string;
    format: string;
    duration?: string;
    genre?: string;
    rating?: string;
  };
}

type PaymentMethod = 'khqr' | 'aba' | null;

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const showtimeId = params.id as string;

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push(`/customer/login?redirect=/checkout/${showtimeId}`);
      return;
    }

    // Retrieve booking data from sessionStorage
    const storedData = sessionStorage.getItem('pendingBooking');
    if (!storedData) {
      alert('No booking data found. Please select seats first.');
      router.push('/movies');
      return;
    }

    try {
      const data = JSON.parse(storedData);
      if (data.showtimeId !== showtimeId) {
        alert('Booking data mismatch. Please try again.');
        router.push('/movies');
        return;
      }
      setBookingData(data);
    } catch (error) {
      console.error('Failed to parse booking data:', error);
      router.push('/movies');
    }
  }, [showtimeId, user, router]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }

    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    if (!bookingData) return;

    setProcessing(true);
    try {
      // Create booking
      const bookingResponse = await api.post('/api/customer/bookings', {
        showtime_id: bookingData.showtimeId,
        seat_ids: bookingData.seatIds,
        total_price: bookingData.totalPrice,
        payment_method: paymentMethod,
      });

      const bookingId = bookingResponse.data.data.id;

      // Clear sessionStorage
      sessionStorage.removeItem('pendingBooking');

      // Redirect based on payment method
      if (paymentMethod === 'khqr') {
        router.push(`/payment/khqr/${bookingId}`);
      } else if (paymentMethod === 'aba') {
        router.push(`/payment/aba/${bookingId}`);
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      alert(error.response?.data?.message || 'Booking failed. Please try again.');
      setProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pb-20">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent" />
        
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Seat Selection
          </Button>

          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-black text-white">
              Secure <span className="text-red-600">Checkout</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Method Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Select Payment Method</h2>
              
              <div className="space-y-4">
                {/* KHQR Payment */}
                <button
                  onClick={() => setPaymentMethod('khqr')}
                  className={`w-full p-6 rounded-lg border-2 transition-all duration-200 ${
                    paymentMethod === 'khqr'
                      ? 'border-red-600 bg-red-600/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-white">KHQR</h3>
                        <p className="text-sm text-gray-400">
                          Pay with any bank app via KHQR
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-blue-600/20 text-blue-400 text-xs">
                            Instant
                          </Badge>
                          <Badge className="bg-green-600/20 text-green-400 text-xs">
                            Secure
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'khqr' && (
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </button>

                {/* ABA Payment */}
                <button
                  onClick={() => setPaymentMethod('aba')}
                  className={`w-full p-6 rounded-lg border-2 transition-all duration-200 ${
                    paymentMethod === 'aba'
                      ? 'border-red-600 bg-red-600/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-red-700 rounded-lg flex items-center justify-center">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-white">ABA Pay</h3>
                        <p className="text-sm text-gray-400">
                          Pay with ABA Mobile Banking
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-blue-600/20 text-blue-400 text-xs">
                            Fast
                          </Badge>
                          <Badge className="bg-green-600/20 text-green-400 text-xs">
                            Trusted
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {paymentMethod === 'aba' && (
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </Card>

            {/* Terms and Conditions */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Terms & Conditions</h2>
              <div className="space-y-3 text-sm text-gray-400">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-600 focus:ring-offset-0"
                  />
                  <span>
                    I agree to the{' '}
                    <a href="#" className="text-red-500 hover:text-red-400">
                      terms and conditions
                    </a>{' '}
                    and understand that tickets are non-refundable once purchased.
                  </span>
                </label>
              </div>
            </Card>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">Secure Payment</p>
                <p className="text-blue-400">
                  Your payment information is encrypted and secure. We never store your payment details.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800 sticky top-24">
              <div className="p-6 space-y-6">
                <h3 className="text-xl font-bold text-white">Order Summary</h3>

                {/* Movie Info */}
                <div className="flex gap-4">
                  <div className="relative w-20 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-gray-950">
                    <Image
                      src={bookingData.showtime.moviePoster}
                      alt={bookingData.showtime.movieTitle}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-white text-sm line-clamp-2">
                      {bookingData.showtime.movieTitle}
                    </h4>
                    <Badge className="bg-red-600/20 text-red-400 border-red-600/30 text-xs">
                      {bookingData.showtime.format}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm border-t border-gray-800 pt-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="text-xs">
                      {bookingData.showtime.cinemaName} - {bookingData.showtime.auditoriumName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span className="text-xs">
                      {new Date(bookingData.showtime.startTime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span className="text-xs">
                      {new Date(bookingData.showtime.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Seats */}
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Selected Seats</span>
                    <span className="text-white font-semibold">
                      {bookingData.seats.map(s => `${s.row}${s.number}`).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{bookingData.seats.length} × ${(bookingData.totalPrice / bookingData.seats.length).toFixed(2)}</span>
                    <span className="text-white">${bookingData.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total</span>
                    <span className="text-2xl font-black text-red-500">
                      ${bookingData.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={!paymentMethod || !agreedToTerms || processing}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Payment
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By completing this purchase, you agree that tickets are non-refundable.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}