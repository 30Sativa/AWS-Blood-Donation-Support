import React from "react";
import bgImage from "../../assets/HomePage/blood-bg.jpg";
import { Heart, Users, Award } from "lucide-react";

const Introduction: React.FC = () => {
    return (
        <section
            // ĐIỀU CHỈNH ẢNH NỀN: Sử dụng bg-[position:25%_center] để ảnh bị dịch chuyển sang trái (lệch trái)
            // Thay thế cho cú pháp cũ bg-position-[center_left_-400px]
            className="relative w-full h-[70vh] flex items-center bg-cover bg-position-[center_left_-400px]" 
            style={{
                backgroundImage: `url(${bgImage})`,
            }}
        >
            {/* Overlay mờ để chữ nổi bật */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px]"></div>

            {/* Nội dung: FIX PHÌNH BẰNG max-w-7xl và căn giữa mx-auto */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6"> 
                
                {/* Bên trái */}
                <div className="text-gray-800 md:w-1/2 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold">
                        Every Drop of Blood <br />
                        <span className="text-red-600">Is a Life</span>
                    </h1>

                    <p className="text-gray-700 leading-relaxed">
                        Join the blood donation community and help save thousands of lives every day.
                        Our modern blood bank management system connects donors and recipients quickly and efficiently.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button className="bg-red-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-700 transition">
                            Register to donate blood
                        </button>
                        <button className="bg-white text-red-600 font-medium px-6 py-2 rounded-lg shadow-md border border-red-500 hover:bg-red-100 transition">
                            Searching for blood
                        </button>
                    </div>
                </div>

                {/* Bên phải */}
                <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
                    <div className="bg-red-100 p-6 md:p-6 rounded-3xl shadow-lg relative w-full max-w-xl">
                        <div className="bg-white rounded-2xl p-6 space-y-6 shadow-md relative z-8">
                            {/* Item 1 */}
                            <div className="flex items-center gap-6">
                                <div className="bg-red-100 p-4 rounded-full shadow-sm">
                                    <Heart className="text-red-500 w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-black">50,000+</p>
                                    <p className="text-base text-gray-600">Blood donors</p>
                                </div>
                            </div>

                            {/* Item 2 */}
                            <div className="flex items-center gap-6">
                                <div className="bg-red-100 p-4 rounded-full shadow-sm">
                                    <Users className="text-red-500 w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-black">100,000+</p>
                                    <p className="text-base text-gray-600">The person who was saved</p>
                                </div>
                            </div>

                            {/* Item 3 */}
                            <div className="flex items-center gap-6">
                                <div className="bg-red-100 p-4 rounded-full shadow-sm">
                                    <Award className="text-red-500 w-8 h-8" />
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