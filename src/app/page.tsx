"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Bell, User } from "lucide-react";
import { User as IUser } from "@/types/users";
import Navbar from "@/components/Navbar";

interface Movie {
  id: number;
  title: string;
  type: string;
  genre: string;
  duration_minutes: number;
  poster_url: string;
}

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get("/api/movies");
        setMovies(res.data.data);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">

          <Navbar />
      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Featured Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-white mb-10">Featured Movie</h2>
          <div className="relative rounded-2xl overflow-hidden h-[600px] bg-gray-900/30 backdrop-blur-sm border border-gray-800/50">
            {movies[0] && (
              <>
                <img 
                  src={movies[0].poster_url || "/default-poster.png"} 
                  alt={movies[0].title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-end p-12">
                  <div className="inline-flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">Featured</span>
                    {movies[0].type === 'upcoming' && (
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">Coming Soon</span>
                    )}
                  </div>
                  <h3 className="text-5xl font-bold text-white mb-4 leading-tight">{movies[0].title}</h3>
                  <p className="text-xl text-gray-300 mb-8">{movies[0].genre} • {movies[0].duration_minutes} min</p>
                  <div className="flex items-center space-x-4">
                    <Link href={`/customer/book/${movies[0].id}`}>
                      <Button className="bg-red-600 hover:bg-red-500 text-white px-8 py-6 text-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20">
                        Book Now
                      </Button>
                    </Link>
                    <Link href={`/movies/${movies[0].id}`}>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Now Showing Grid */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-white mb-10">Now Showing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {movies.map((movie) => (
              <Card key={movie.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 bg-gray-900/30 hover:bg-gray-900/50 backdrop-blur-md border border-gray-800/50 hover:border-gray-700">
                <div className="relative">
                  <img
                    src={movie.poster_url || "/default-poster.png"}
                    alt={movie.title}
                    className="w-full h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute inset-x-0 bottom-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center space-x-3 text-white/90">
                      <span className="px-3 py-1.5 bg-red-600/90 rounded-lg text-sm font-medium">{movie.type}</span>
                      <span className="px-3 py-1.5 bg-gray-800/80 rounded-lg text-sm">{movie.duration_minutes} min</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white/90 line-clamp-1 group-hover:text-white transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-gray-400">{movie.genre}</p>
                  </div>
                  <Link href={`/movies/${movie.id}`} className="block">
                    <Button 
                      className="w-full bg-red-600/80 hover:bg-red-600 text-white py-6 text-base transition-all duration-300 hover:shadow-xl hover:shadow-red-600/20"
                    >
                      View Showtimes
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-red-600">Legend</span>
                <span className="text-2xl font-light text-white">Cinema</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your premier destination for the latest movies and entertainment.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/movies" className="hover:text-white transition-colors">Movies</Link></li>
                <li><Link href="/showtimes" className="hover:text-white transition-colors">Showtimes</Link></li>
                <li><Link href="/coming-soon" className="hover:text-white transition-colors">Coming Soon</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">Subscribe to our newsletter for updates and exclusive offers.</p>
                <Button className="w-full bg-red-600/90 hover:bg-red-600 text-white">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Legend Cinema. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}