import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export default function HeroSection() {
  const [titleRef, titleVisible] = useScrollAnimation({ threshold: 0.2 });
  const [statsRef, statsVisible] = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="relative bg-gradient-to-br from-red-50 via-pink-50 to-red-50 py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-r from-red-200 via-pink-200 to-red-200 blur-3xl animate-pulse"></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-red-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-pink-400 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-red-300 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div
            ref={titleRef}
            className={`space-y-4 sm:space-y-6 text-center md:text-left transition-all duration-1000 ${
              titleVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Every Drop of Blood{" "}
              <span className="text-red-600 animate-pulse">Is a Life</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Join the blood donation community and help save thousands of lives
              every day. Our modern blood bank management system connects donors
              and recipients quickly and efficiently.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
              <Link
                to="/register"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium text-base sm:text-lg w-full sm:w-auto text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Register to donate blood
              </Link>
              <Link
                to="/"
                className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300 font-medium text-base sm:text-lg w-full sm:w-auto text-center transform hover:-translate-y-1"
              >
                Searching for blood
              </Link>
            </div>
          </div>

          {/* Right Statistics Card */}
          <div
            ref={statsRef}
            className={`bg-gradient-to-br from-pink-100 to-pink-50 rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-1000 delay-300 ${
              statsVisible
                ? "opacity-100 translate-x-0 scale-100"
                : "opacity-0 translate-x-10 scale-95"
            }`}
          >
            <div className="space-y-4 sm:space-y-6">
              {/* Stat 1 */}
              <div className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    50,000+
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">Blood donors</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    100,000+
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">The person who was saved</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-3 sm:gap-4 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">15 years</div>
                  <div className="text-sm sm:text-base text-gray-600">Service experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
