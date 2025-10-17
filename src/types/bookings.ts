
export interface BookingSeat {
  id: number;
  booking_id: number;
  seat_id: number;
  created_at: string | null;
  updated_at: string | null;
  seat: {
    id: number;
    auditorium_id: number;
    seat_row: string;
    seat_number: number;
    created_at: string;
    updated_at: string;
  };
}

export interface BookingUser {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface BookingShowtime {
  id: number;
  movie: {
    id: number;
    title: string;
  };
  start_time: string;
}

export interface Booking {
  id: number;
  user_id?: number;
  user?: BookingUser;
  showtime: BookingShowtime;
  booking_seats: BookingSeat[];
  total_price: number | string;
  status: 'pending' | 'paid' | 'cancelled' | string;
  payment_method?: 'khqr' | 'aba' | null | string;
  payment_reference?: string | null;
  paid_at?: string | null;
  booking_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingListMeta {
  total: number;
  per_page: number;
  current_page: number;
}

export interface BookingListSummary {
  total_bookings: number;
  total_revenue: number | string;
  pending_bookings: number;
  payment_methods: Array<{
    payment_method: string;
    count: number;
  }>;
}

export interface BookingListResponse {
  bookings: {
    data: Booking[];
    total: number;
    per_page: number;
    current_page: number;
  };
  summary: BookingListSummary;
}

export interface BookingHistory {
  changed_at: string;
  old_status: string;
  new_status: string;
  notes: string;
}

export interface BookingDetailsResponse {
  booking: Booking & { user: BookingUser };
  history: BookingHistory[];
}