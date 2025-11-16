import React from "react";
import bgImage from "../../assets/HomePage/blood-bg.jpg";
import { Heart, Users, Award } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useCountUp } from "../../hooks/useCountUp";

const Introduction: React.FC = () => {
    const { ref: leftRef, isVisible: leftVisible } = useScrollAnimation({ threshold: 0.2 });
    const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation({ threshold: 0.2 });
    
    const donorsCount = useCountUp({ end: 50000, enabled: rightVisible });
    const savedCount = useCountUp({ end: 100000, enabled: rightVisible });

    return (
        <section
            className="relative w-full h-[70vh] flex items-center justify-center bg-cover bg-position-[center_left_-400px] px-10 md:px-20 overflow-hidden"
            style={{
                backgroundImage: `url(${bgImage})`,
            }}
        >
            {/* Overlay mờ để chữ nổi bật */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px]"></div>

            {/* Nội dung */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-8xl">
                {/* Bên trái */}
                <div 
                    ref={leftRef}
                    className={`text-gray-800 md:w-1/2 space-y-6 transition-all duration-1000 ${
                        leftVisible 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 -translate-x-10'
                    }`}
                >
                    <h1 className="text-4xl md:text-5xl font-bold animate-fade-in">
                        Every Drop of Blood <br />
                        <span className="text-red-600 inline-block animate-pulse">Is a Life</span>
                    </h1>

                    <p className="text-gray-700 leading-relaxed">
                        Join the blood donation community and help save thousands of lives every day.
                        Our modern blood bank management system connects donors and recipients quickly and efficiently.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button className="bg-red-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 hover:scale-105 hover:shadow-xl transform">
                            Register to donate blood
                        </button>
                        <button className="bg-white text-red-600 font-medium px-6 py-2 rounded-lg shadow-md border border-red-500 hover:bg-red-100 transition-all duration-300 hover:scale-105 hover:shadow-xl transform">
                            Searching for blood
                        </button>
                    </div>
                </div>

                {/* Bên phải */}
                <div 
                    ref={rightRef}
                    className={`md:w-1/2 mt-10 md:mt-0 flex justify-center transition-all duration-1000 delay-300 ${
                        rightVisible 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 translate-x-10'
                    }`}
                >
                    <div className="bg-red-100 p-6 md:p-6 rounded-3xl shadow-lg relative w-full max-w-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="bg-white rounded-2xl p-6 space-y-6 shadow-md relative z-8">
                            {/* Item 1 */}
                            <div className="flex items-center gap-6 group">
                                <div className="bg-red-100 p-4 rounded-full shadow-sm group-hover:bg-red-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 transform">
                                    <Heart className="text-red-500 w-8 h-8 group-hover:animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-black">
                                        {donorsCount.toLocaleString()}+
                                    </p>
                                    <p className="text-base text-gray-600">Blood donors</p>
                                </div>
                            </div>

                            {/* Item 2 */}
                            <div className="flex items-center gap-6 group">
                                <div className="bg-red-100 p-4 rounded-full shadow-sm group-hover:bg-red-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 transform">
                                    <Users className="text-red-500 w-8 h-8 group-hover:animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-black">
                                        {savedCount.toLocaleString()}+
                                    </p>
                                    <p className="text-base text-gray-600">The person who was saved</p>
                                </div>
                            </div>

                            {/* Item 3 */}
                            <div className="flex items-center gap-6 group">
                                <div className="bg-red-100 p-4 rounded-full shadow-sm group-hover:bg-red-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 transform">
                                    <Award className="text-red-500 w-8 h-8 group-hover:animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-black">15 years</p>
                                    <p className="text-base text-gray-600">Service experience</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Introduction;