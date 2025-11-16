import React from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const HeroCTA: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <section 
      ref={ref}
      className="bg-[#FFF0F0] py-20 text-center border-t-4 border-red-600 relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-red-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-red-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className={`max-w-3xl mx-auto px-6 relative z-10 transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-10 scale-95'
      }`}>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Become a Hero Today
        </h2>
        <p className="text-gray-700 mb-8">
          Each blood donation can save up to 3 lives. Register now to become
          part of our community of silent heroes.
        </p>
        <button className="bg-red-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 hover:scale-110 hover:shadow-xl transform font-semibold">
          Sign up now
        </button>
      </div>
    </section>
  );
};

export default HeroCTA;