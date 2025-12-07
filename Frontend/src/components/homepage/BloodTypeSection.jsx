import { useScrollAnimation } from "../../hooks/useScrollAnimation";

export default function BloodTypeSection() {
  const bloodTypes = [
    { type: "A", status: 99 },
    { type: "B", status: 85 },
    { type: "AB", status: 75 },
    { type: "O", status: 95 },
  ];

  const [sectionRef, sectionVisible] = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
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
            Existing Blood Type
          </h2>
          <p className="text-gray-600 text-base sm:text-lg">
            Current blood reserve status
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bloodTypes.map((bloodType, index) => {
            const [cardRef, cardVisible] = useScrollAnimation({
              threshold: 0.2,
            });
            return (
              <div
                key={bloodType.type}
                ref={cardRef}
                className={`bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                  cardVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                  {/* Icon */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>

                  {/* Blood Type */}
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {bloodType.type}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">Blood type</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-700 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: sectionVisible ? `${bloodType.status}%` : "0%",
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Status: {bloodType.status}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
