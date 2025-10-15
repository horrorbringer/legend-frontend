import Link from "next/link";

export default function ClientFooter() {
  return (
      <footer className="bg-gray-900/50 border-t border-gray-800/50 mt-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-black text-white mb-4">CineBook</h3>
              <p className="text-gray-400 text-sm">
                Your premier destination for movie bookings. Experience cinema like never before.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/movies" className="hover:text-white transition-colors">Now Showing</Link></li>
                <li><Link href="/coming-soon" className="hover:text-white transition-colors">Coming Soon</Link></li>
                <li><Link href="/theaters" className="hover:text-white transition-colors">Theaters</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <p className="text-gray-400 text-sm mb-4">
                Follow us on social media for the latest updates and exclusive offers.
              </p>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                  <span className="text-white text-xs font-bold">FB</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                  <span className="text-white text-xs font-bold">TW</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer">
                  <span className="text-white text-xs font-bold">IG</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CineBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
  )
}
