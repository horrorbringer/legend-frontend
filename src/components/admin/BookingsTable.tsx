"use client";

import { Booking } from "@/types/bookings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface BookingsTableProps {
  bookings: Booking[];
  onViewDetails: (bookingId: number) => void;
}

export function BookingsTable({ bookings, onViewDetails }: BookingsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border border-gray-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Movie</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Seats</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">#{booking.id}</TableCell>
              <TableCell>
                {booking.user?.name || 'N/A'}
                {booking.user?.email && (
                  <div className="text-sm text-gray-500">{booking.user.email}</div>
                )}
              </TableCell>
              <TableCell>{booking.showtime.movie.title}</TableCell>
              <TableCell>
                {format(new Date(booking.showtime.start_time), "MMM d, yyyy")}
                <div className="text-sm text-gray-500">
                  {format(new Date(booking.showtime.start_time), "h:mm a")}
                </div>
              </TableCell>
              <TableCell>
                {booking.booking_seats
                  .map(bs => `${bs.seat.seat_row}${bs.seat.seat_number}`)
                  .join(", ")}
              </TableCell>
              <TableCell>
                ${typeof booking.total_price === 'string' 
                  ? parseFloat(booking.total_price).toFixed(2)
                  : booking.total_price.toFixed(2)
                }
              </TableCell>
              <TableCell>{getStatusBadge(booking.status)}</TableCell>
              <TableCell>
                {booking.payment_method ? (
                  <span className="capitalize">{booking.payment_method}</span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(booking.id)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}