import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export default function ServicesSection() {
  const services = [
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
      title: "Blood Donation",
      description:
        "Join our community of blood donors and make a life-saving difference. Our streamlined process makes donation quick and comfortable.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      title: "Receive Blood",
      description:
        "Find compatible blood donors quickly when you need it most. Our matching system connects recipients with available donors efficiently.",
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
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      title: "24/7 Emergency",
      description:
        "Round-the-clock emergency blood services available. Our dedicated team is always ready to assist in critical situations.",
    },
  ];

  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div
          ref={sectionRef}
          className={`text-center mb-8 sm:mb-12 transition-all duration-1000 ${
            sectionVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Our Services
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            We provide comprehensive services for blood donation and collection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => {
            const [cardRef, cardVisible] = useScrollAnimation({
              threshold: 0.2,
            });
            return (
              <div
                key={index}
                ref={cardRef}
                className={`bg-white rounded-xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 ${
                  cardVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-red-600 mb-4 transform hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                  {service.description}
                </p>
                <a
                  href="#"
                  className="text-red-600 font-medium hover:text-red-700 inline-flex items-center gap-2 group"
                >
                  Learn more
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
