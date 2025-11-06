import React from "react";

const HeroCTA: React.FC = () => {
    return (
        <section className="bg-[#FFF0F0] py-20 text-center border-t-4 border-red-600">
            {/* Điều chỉnh max-w: Giảm xuống 3xl để khối nội dung chặt chẽ hơn */}
            <div className="max-w-3xl mx-auto px-6"> 
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Become a Hero Today
                </h2>
                <p className="text-gray-700 mb-8">
                    Each blood donation can save up to 3 lives. Register now to become
                    part of our community of silent heroes.
                </p>
                <button className="bg-red-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-red-700 transition">
                    Sign up now
                </button>
            </div>
        </section>
    );
};

export default HeroCTA;