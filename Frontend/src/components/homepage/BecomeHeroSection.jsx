import { Link } from "react-router-dom";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export default function BecomeHeroSection() {
  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div
          ref={sectionRef}
          className={`text-center max-w-3xl mx-auto space-y-4 sm:space-y-6 transition-all duration-1000 ${
            sectionVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-95"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
            Become a Hero Today
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-4">
            Each blood donation can save up to 3 lives. Register now to become
            part of our community of silent heroes.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Sign up now
          </Link>
        </div>
      </div>
    </section>
  );
}
