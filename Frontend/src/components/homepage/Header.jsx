import { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
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
            <span className="text-xl sm:text-2xl font-bold text-gray-900">Blood Bank</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 transition text-sm xl:text-base">
              Home
            </Link>
            <Link to="/" className="text-gray-700 hover:text-red-600 transition text-sm xl:text-base">
              Introduce
            </Link>
            <Link to="/" className="text-gray-700 hover:text-red-600 transition text-sm xl:text-base">
              Service
            </Link>
            <Link to="/" className="text-gray-700 hover:text-red-600 transition text-sm xl:text-base">
              Contact
            </Link>
            <Link to="/" className="text-gray-700 hover:text-red-600 transition text-sm xl:text-base">
              Blog
            </Link>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <Link
              to="/login"
              className="px-4 lg:px-6 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm lg:text-base"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 lg:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm lg:text-base"
            >
              Register
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-red-600 transition"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4 pt-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-red-600 transition py-2"
              >
                Home
              </Link>
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-red-600 transition py-2"
              >
                Introduce
              </Link>
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-red-600 transition py-2"
              >
                Service
              </Link>
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-red-600 transition py-2"
              >
                Contact
              </Link>
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:text-red-600 transition py-2"
              >
                Blog
              </Link>
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-6 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-center"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-center"
                >
                  Register
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
