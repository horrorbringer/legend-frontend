
export interface Booking {
  id: number;
  total_price: number;
  status: string;
  showtime: {
    start_time: string;
    movie: { title: string };
  };
  seats: { seat_number: string }[];
}