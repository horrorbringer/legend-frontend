import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 border-b">
      <Link href="/movies">🎬 Movies</Link>
      <Link href="/bookings">📖 My Bookings</Link>
      <Link href="/profile">👤 Profile</Link>
    </nav>
  );
}
