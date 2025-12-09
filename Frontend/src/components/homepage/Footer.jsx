import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Logo and Slogan */}
          <div className="space-y-3 sm:space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold">Blood Connect</span>
            </Link>
            <p className="text-gray-400 text-xs sm:text-sm">
              Save lives with every drop of blood you donate.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-4">Link</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Introduce
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Service
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Instruct
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Hotline: 1900-xxxx</li>
              <li>Email: info@nganhangmau.vn</li>
              <li>Address: Ho Chi Minh, Vietnam</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            © 2024 Blood Connect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
