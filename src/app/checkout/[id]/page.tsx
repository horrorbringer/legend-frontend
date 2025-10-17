// app/checkout/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Clock, MapPin, Calendar, CreditCard, 
  ArrowLeft, Check, Loader2, Shield, Smartphone, Building, CheckCircle, Copy, AlertCircle
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
  };
}

type PaymentMethod = 'khqr' | 'aba' | null;
type CheckoutStep = 'select' | 'payment' | 'success';

interface KHQRData {
  qr_code: string; // Base64 QR code image
  reference_number: string;
  amount: string | number;
  expires_at: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const showtimeId = params.id as string;

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [step, setStep] = useState<CheckoutStep>('select');
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [khqrData, setKhqrData] = useState<KHQRData | null>(null);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push(`/customer/login?redirect=/checkout/${showtimeId}`);
      return;
    }

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

  // Countdown and auto-check for payment
  useEffect(() => {
    if (step !== 'payment' || !bookingId) return;

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

    const checker = setInterval(() => {
      checkPaymentStatus();
    }, 10000); // Check every 10 seconds

    return () => {
      clearInterval(timer);
      clearInterval(checker);
    };
  }, [step, bookingId]);

  const handleCreateBooking = async () => {
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
      // Create booking with selected payment method
      const bookingResponse = await api.post('/api/bookings', {
        showtime_id: bookingData.showtimeId,
        seat_ids: bookingData.seatIds,
        total_price: bookingData.totalPrice,
        payment_method: paymentMethod,
      });

      const newBookingId = bookingResponse.data.data.id;
      setBookingId(newBookingId);

      // If KHQR, generate QR code
      if (paymentMethod === 'khqr') {
        const khqrResponse = await api.post(`/api/bookings/${newBookingId}/khqr/generate`);
        console.log('KHQR Response:', khqrResponse.data.data);
        if (!khqrResponse.data.data.qr_code) {
          throw new Error('QR code data is missing from the response');
        }
        setKhqrData(khqrResponse.data.data);
        setStep('payment');
      } else if (paymentMethod === 'aba') {
        // ABA will be implemented later
        alert('ABA payment will be available soon');
        setProcessing(false);
        return;
      }

      // Clear sessionStorage
      sessionStorage.removeItem('pendingBooking');
    } catch (error: any) {
      console.error('Payment failed:', error);
      alert(error.response?.data?.message || 'Booking failed. Please try again.');
      setProcessing(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (checking || !bookingId) return;
    
    setChecking(true);
    try {
      const response = await api.get(`/api/bookings/${bookingId}/check-payment`);
      const { success, status, message } = response.data;

      if (success && status === 'paid') {
        // Payment confirmed
        setStep('success');
      } else if (success && status === 'pending') {
        // Payment still pending
        console.log('Payment not confirmed yet. Please wait a moment and try again.');
      } else {
        // Handle other cases (unauthorized, no reference, etc.)
        console.log(message || 'Unable to verify payment. Please contact support if you have completed the payment.');
      }
    } catch (error: any) {
      console.error('Failed to check payment status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to check payment status. Please try again.';
      console.log(errorMessage);
    } finally {
      setChecking(false);
    }
  };

  const handleExpired = async () => {
    try {
      if (bookingId) {
        await api.post(`/api/bookings/${bookingId}/cancel`);
      }
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

  // Success Step
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black flex items-center justify-center p-4">
        <Card className="bg-gray-900/50 border-gray-800 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-400 mb-6">Your booking has been confirmed</p>
          <Button
            onClick={() => router.push(`/movies`)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            View Booking Details
          </Button>
        </Card>
      </div>
    );
  }

  // Payment Step (KHQR)
  if (step === 'payment' && khqrData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pb-20">
        <div className="relative overflow-hidden border-b border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent" />
          
          <div className="relative max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl md:text-4xl font-black text-white">
                KHQR <span className="text-blue-500">Payment</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <Card className="bg-gray-900/50 border-gray-800 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
              
              <div className="relative">
                <div className="text-center space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Scan QR Code to Pay</h2>
                    <p className="text-blue-400 text-sm font-medium">
                      Use any banking app that supports KHQR
                    </p>
                  </div>
                  
                  {/* Amount Display */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-4 mb-6">
                    <p className="text-gray-400 text-sm mb-1">Amount to Pay</p>
                    <p className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                      ${Number(khqrData.amount).toFixed(2)}
                      <span className="text-sm text-gray-400">USD</span>
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="relative bg-gradient-to-r from-blue-400/5 to-indigo-400/5 p-1 rounded-xl">
                    <div className="bg-white p-3 rounded-xl mx-auto relative overflow-hidden">
                      {khqrData.qr_code ? (
                        <div 
                          className="w-[330px] h-[330px] mx-auto"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          dangerouslySetInnerHTML={{
                            __html: atob(khqrData.qr_code).replace('<svg', '<svg width="100%" height="100%"')
                          }}
                        />
                      ) : (
                        <div className="w-[300px] h-[300px] flex items-center justify-center bg-gray-100">
                          <AlertCircle className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Reference Number */}
                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Reference Number</p>
                          <code className="text-lg font-mono text-white">{khqrData.reference_number}</code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(khqrData.reference_number)}
                          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2 rounded-lg transition-colors duration-200"
                        >
                          {copied ? (
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              <span className="text-sm">Copied!</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Copy className="w-4 h-4" />
                              <span className="text-sm">Copy</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Security Note */}
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Shield className="w-4 h-4" />
                      <p className="text-sm">
                        Scan with any banking app that supports KHQR
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Booking Summary */}
            <div className="space-y-6">
              <Card className="bg-gray-900/50 border-gray-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Booking Details</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-gray-950">
                      <Image
                        src={bookingData.showtime.moviePoster}
                        alt={bookingData.showtime.movieTitle}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-sm mb-1">
                        {bookingData.showtime.movieTitle}
                      </h4>
                      <p className="text-gray-400 text-xs">
                        {bookingData.showtime.cinemaName}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-3">
                    <p className="text-gray-400 text-xs mb-1">Seats</p>
                    <p className="text-white text-sm">
                      {bookingData.seats.map(s => `${s.row}${s.number}`).join(', ')}
                    </p>
                  </div>

                  <div className="border-t border-gray-800 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Amount</span>
                      <span className="text-xl font-bold text-blue-500">
                        ${bookingData.totalPrice.toFixed(2)}
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
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                    <span>Open your banking app that supports KHQR</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                    <span>Scan the QR code above</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                    <span>Verify the amount and complete the payment</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</span>
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

  // Select Payment Method Step
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pb-20">
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
                        <h3 className="text-lg font-bold text-white">KHQR (Bakong)</h3>
                        <p className="text-sm text-gray-400">
                          Pay with any bank app via KHQR
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-blue-600/20 text-blue-400 text-xs">Instant</Badge>
                          <Badge className="bg-green-600/20 text-green-400 text-xs">Secure</Badge>
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

                {/* ABA Payment - Coming Soon */}
                <button
                  disabled
                  className="w-full p-6 rounded-lg border-2 border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                        <Building className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-400">ABA Pay</h3>
                        <p className="text-sm text-gray-500">Coming soon...</p>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </Card>

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
                    <a href="#" className="text-red-500 hover:text-red-400">terms and conditions</a>
                    {' '}and understand that tickets are non-refundable once purchased.
                  </span>
                </label>
              </div>
            </Card>

            <div className="flex items-start gap-3 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">Secure Payment</p>
                <p className="text-blue-400">
                  Your payment is processed through Bakong KHQR, Cambodia's national payment gateway.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800 sticky top-24">
              <div className="p-6 space-y-6">
                <h3 className="text-xl font-bold text-white">Order Summary</h3>

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

                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total</span>
                    <span className="text-2xl font-black text-red-500">
                      ${bookingData.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCreateBooking}
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
                      Proceed to Payment
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