import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Star, Calendar, Film, Sparkles, TrendingUp, Award, Users } from "lucide-react";
import ClientLayout from "@/components/ClientLayout";

interface Movie {
  id: number;
  title: string;
  status: string; // 'now_showing', 'upcoming', 'archived'
  format?: string; // '2D', '3D', 'IMAX', '4DX'
  genre: string;
  duration: string; // "120 mins" format from API
  poster: string;
  rating?: string;
  release_date?: string;
  description?: string;
}

export const revalidate = 0;

export default async function HomePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch movies");
  }

  const data = await res.json();
  const movies: Movie[] = data.data;

  const featured = movies[0];
  const nowShowing = movies.filter(m => m.status === 'now_showing').slice(0, 8);
  const upcoming = movies.filter(m => m.status === 'upcoming').slice(0, 4);

  return (
    <ClientLayout>
      {/* NOTE: Navbar is now in ClientLayout - no need to add it here */}

      {/* Hero Section with Featured Movie */}
      <section className="relative h-[90vh] overflow-hidden">
        {featured && (
          <>
            {/* Background Image with Parallax Effect */}
            <div className="absolute inset-0">
              <Image
                src={featured.poster || "/default-poster.png"}
                alt={featured.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="h-full flex items-center">
                <div className="max-w-3xl space-y-8">
                  {/* Badges */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-full">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-bold text-white">FEATURED</span>
                    </div>
                    {featured.status === "upcoming" && (
                      <div className="px-4 py-2 bg-blue-600 rounded-full">
                        <span className="text-sm font-bold text-white">COMING SOON</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/50 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-yellow-500">
                        {featured.rating || "8.5"}/10
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-7xl font-black text-white leading-tight tracking-tight">
                    {featured.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">{featured.release_date || "2024"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">{featured.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Film className="w-5 h-5" />
                      <span className="font-medium">{featured.genre}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                    {featured.description || 
                      "Experience the most anticipated movie of the year. Immerse yourself in a world of stunning visuals, compelling storytelling, and unforgettable performances."}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex items-center gap-4 pt-4">
                    <Link href={`/customer/book/${featured.id}`}>
                      <Button className="bg-red-600 hover:bg-red-700 text-white px-10 py-7 text-lg font-bold rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/50 hover:scale-105">
                        <Film className="w-5 h-5 mr-2" />
                        Book Tickets Now
                      </Button>
                    </Link>
                    <Link href={`/movies/${featured.id}`}>
                      <Button
                        variant="outline"
                        className="border-2 border-white/30 text-red-500 hover:bg-white/30 backdrop-blur-sm px-10 py-7 text-lg font-bold rounded-xl transition-all duration-300"
                      >
                        More Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
                <div className="w-1.5 h-3 bg-white/50 rounded-full mx-auto animate-pulse" />
              </div>
            </div>
          </>
        )}
      </section>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <Card className="p-6 bg-gradient-to-br from-red-600/10 to-red-600/5 border border-red-600/20 text-center">
            <Film className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-white mb-1">{movies.length}+</p>
            <p className="text-gray-400 text-sm">Movies Available</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-600/20 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-white mb-1">50K+</p>
            <p className="text-gray-400 text-sm">Happy Customers</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-600/20 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-white mb-1">4.9/5</p>
            <p className="text-gray-400 text-sm">Customer Rating</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-yellow-600/10 to-yellow-600/5 border border-yellow-600/20 text-center">
            <Award className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-white mb-1">15+</p>
            <p className="text-gray-400 text-sm">Years Experience</p>
          </Card>
        </section>

        {/* Now Showing Section */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Now Showing</h2>
              <p className="text-gray-400">Watch the latest blockbusters in stunning quality</p>
            </div>
            <Link href="/movies">
              <Button variant="outline" className="border-red-600/50 text-red-600 hover:bg-red-600 hover:text-white">
                View All Movies
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nowShowing.map((movie) => (
              <Card
                key={movie.id}
                className="group overflow-hidden bg-gray-900/40 border border-gray-800/50 hover:border-red-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-600/20 hover:-translate-y-2"
              >
                <div className="relative h-[450px] overflow-hidden">
                  <Image
                    src={movie.poster || "/default-poster.png"}
                    alt={movie.title}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-yellow-500">
                            {movie.rating || "8.2"}
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-red-600/90 rounded text-xs font-bold text-white">
                          {movie.status.toUpperCase()}
                        </span>
                      </div>
                      <Link href={`/showtimes/${movie.id}`} className="block">
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
                          <Film className="w-4 h-4 mr-2" />
                          View Showtimes
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-lg">
                    <div className="flex items-center gap-1.5 text-white">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">{movie.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-red-600 transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">{movie.genre}</p>
                  
                  {movie.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{movie.description}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Coming Soon Section */}
        {upcoming.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-4xl font-black text-white mb-2">Coming Soon</h2>
                <p className="text-gray-400">Get ready for these upcoming blockbusters</p>
              </div>
              <Link href="/coming-soon">
                <Button variant="outline" className="border-blue-600/50 text-blue-600 hover:bg-blue-600 hover:text-white">
                  View All Upcoming
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcoming.map((movie) => (
                <Card
                  key={movie.id}
                  className="group overflow-hidden bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-blue-600/20 hover:border-blue-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-600/20"
                >
                  <div className="relative h-96 overflow-hidden">
                    <Image
                      src={movie.poster || "/default-poster.png"}
                      alt={movie.title}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1.5 bg-blue-600 rounded-full text-xs font-bold text-white">
                        COMING SOON
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-bold text-white line-clamp-1">{movie.title}</h3>
                    <p className="text-sm text-gray-400">{movie.genre}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{movie.release_date || "2024"}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Why Choose Us Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">Why Choose CineBook?</h2>
            <p className="text-gray-400 text-lg">The ultimate movie booking experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-to-br from-gray-900/50 to-gray-900/20 border border-gray-800/50 text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Film className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Premium Screens</h3>
              <p className="text-gray-400">
                Experience movies on state-of-the-art screens with crystal-clear picture quality and immersive Dolby Atmos sound.
              </p>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-gray-900/50 to-gray-900/20 border border-gray-800/50 text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Easy Booking</h3>
              <p className="text-gray-400">
                Book your tickets in seconds with our intuitive interface. Choose your seats, pick your showtime, and you're done!
              </p>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-gray-900/50 to-gray-900/20 border border-gray-800/50 text-center">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Best Prices</h3>
              <p className="text-gray-400">
                Enjoy competitive pricing with exclusive deals and discounts. Premium entertainment doesn't have to break the bank.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 opacity-90" />
          <div className="relative z-10 px-8 py-16 md:py-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready for Your Next Movie Experience?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of movie lovers and book your tickets today. The perfect seat is waiting for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/movies">
                <Button className="bg-white text-black hover:bg-gray-100 px-10 py-7 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105">
                  Browse Movies
                </Button>
              </Link>
              <Link href="/coming-soon">
                <Button
                  variant="outline"
                  className="border-2 border-white text-purple-500 hover:bg-white/10 backdrop-blur-sm px-10 py-7 text-lg font-bold rounded-xl transition-all duration-300"
                >
                  View Coming Soon
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

  </ClientLayout>
  );
}