import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export default function WhyDonateSection() {
  const benefits = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Save Others",
      description:
        "Each blood donation can save up to 3 lives. Your small actions make a big difference.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "Safety & Security",
      description:
        "The blood donation process is strictly controlled, ensuring absolute safety for the donor.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ),
      title: "Health Benefits",
      description:
        "Regular blood donation reduces the risk of heart disease and improves overall health.",
    },
  ];

  const conditions = [
    "Age: 18-60 years old",
    "Weight: Minimum 45kg",
    "Good health, no chronic diseases",
    "Do not use antibiotics",
    "Not pregnant or breastfeeding",
  ];

  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-red-600 via-red-700 to-red-600 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column - Benefits */}
          <div
            ref={sectionRef}
            className={`space-y-6 sm:space-y-8 transition-all duration-1000 ${
              sectionVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Why Should You Donate Blood?
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex gap-3 sm:gap-4 group"
                  style={{
                    animation: sectionVisible
                      ? `fadeInUp 0.6s ease-out ${index * 0.2}s both`
                      : "none",
                  }}
                >
                  <div className="text-white flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-white/90 text-sm sm:text-base">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Conditions */}
          <div
            className={`space-y-4 sm:space-y-6 transition-all duration-1000 delay-300 ${
              sectionVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Blood Donation Conditions
            </h2>
            <ul className="space-y-3">
              {conditions.map((condition, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 group"
                  style={{
                    animation: sectionVisible
                      ? `fadeInUp 0.6s ease-out ${(index + 3) * 0.1}s both`
                      : "none",
                  }}
                >
                  <svg
                    className="w-5 h-5 text-white mt-1 flex-shrink-0 group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-white">{condition}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
