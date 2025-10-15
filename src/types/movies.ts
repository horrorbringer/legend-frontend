export interface ShowtimeGroup {
  cinema: string;
  auditorium: string;
  times: string[]; // ISO date strings
}

export interface Movie {
  id: number;
  title: string;
  genre: string;
  rating: string;
  duration: string;
  type: string;
  release_date: string;
  poster: string;
  showtimes: ShowtimeGroup[];
  created_at: string;
  updated_at: string;
}

export interface MovieResponse {
  data: Movie;
}
