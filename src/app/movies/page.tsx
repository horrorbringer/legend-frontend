// app/movies/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Clock, Film, Calendar, MapPin, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Movie {
  id: string;
  title: string;
  genre: string;
  rating: string;
  duration: string;
  status: 'now_showing' | 'upcoming' | 'archived';
  format: '2D' | '3D' | 'IMAX' | '4DX';
  release_date: string;
  poster: string;
  showtimes?: Array<{
    cinema: string;
    auditorium: string;
    times: string[];
  }>;
}

async function getMovies(): Promise<Movie[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`, {
    cache: 'no-store',
    // next: { revalidate: 60 }
  });
  
  if (!res.ok) throw new Error('Failed to fetch movies');
  
  const data = await res.json();
  return data.data;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'now_showing':
      return {
        color: 'bg-red-600/20 text-red-400 border-red-600/30',
        label: 'Now Showing',
        glow: 'shadow-red-600/50'
      };
    case 'upcoming':
      return {
        color: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
        label: 'Coming Soon',
        glow: 'shadow-blue-600/50'
      };
    case 'archived':
      return {
        color: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
        label: 'Archived',
        glow: 'shadow-gray-600/50'
      };
    default:
      return {
        color: 'bg-gray-600/20 text-gray-400 border-gray-600/30',
        label: status,
        glow: 'shadow-gray-600/50'
      };
  }
}

export default async function MoviesPage() {
  const movies = await getMovies();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-red-600" />
              <div className="absolute inset-0 bg-red-600/30 blur-xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Now <span className="text-red-600">Playing</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl">
            Experience cinema like never before. Book your tickets for the latest blockbusters.
          </p>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map((movie) => {
            const statusConfig = getStatusConfig(movie.status);
            
            return (
              <Link
                key={movie.id}
                href={`/showtimes?movie=${movie.id}`}
                className="group"
              >
                <Card className="relative overflow-hidden bg-gray-900/50 border-gray-800 backdrop-blur-sm transition-all duration-300 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-600/20 hover:-translate-y-2">
                  {/* Poster Section */}
                  <div className="relative aspect-[2/3] bg-gray-950 overflow-hidden">
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${statusConfig.color} border font-semibold backdrop-blur-sm ${statusConfig.glow} shadow-lg`}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Format Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-600/90 text-white border-0 font-bold backdrop-blur-sm shadow-lg shadow-red-600/50">
                        {movie.format}
                      </Badge>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute bottom-3 right-3">
                      <div className="px-2 py-1 bg-yellow-600/90 backdrop-blur-sm rounded text-xs font-bold text-white shadow-lg">
                        {movie.rating}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-white line-clamp-2 group-hover:text-red-500 transition-colors">
                        {movie.title}
                      </h3>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Film className="w-4 h-4 text-red-600" />
                          <span>{movie.genre}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4 text-red-600" />
                          <span>{movie.duration}</span>
                        </div>

                        {movie.release_date && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4 text-red-600" />
                            <span>{new Date(movie.release_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Showtimes Preview */}
                    {movie.showtimes && movie.showtimes.length > 0 && (
                      <div className="pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-red-600" />
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Available At
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          {movie.showtimes.slice(0, 2).map((showtime, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-gray-800/50 rounded px-3 py-2">
                              <span className="font-medium text-gray-300 truncate">
                                {showtime.cinema}
                              </span>
                              <span className="text-red-500 font-semibold whitespace-nowrap ml-2">
                                {showtime.times.length} shows
                              </span>
                            </div>
                          ))}
                          {movie.showtimes.length > 2 && (
                            <p className="text-xs text-red-500 font-medium text-center pt-1">
                              +{movie.showtimes.length - 2} more locations
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Book Now CTA */}
                    <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 group-hover:scale-[1.02]">
                      Book Tickets
                    </button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {movies.length === 0 && (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <Film className="w-20 h-20 mx-auto text-gray-700 mb-6" />
              <div className="absolute inset-0 bg-red-600/20 blur-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Movies Available</h3>
            <p className="text-gray-400 text-lg">Check back soon for upcoming blockbusters!</p>
          </div>
        )}
      </div>
    </div>
  );
}