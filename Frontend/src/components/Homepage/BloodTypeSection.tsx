import React from "react";
import { Droplet } from "lucide-react";

const bloodTypes = [
    { type: "A", status: "Stable", percent: 40 },
    { type: "B", status: "Stable", percent: 65 },
    { type: "AB", status: "Stable", percent: 80 },
    { type: "O", status: "Stable", percent: 75 },
];

const BloodTypeSection: React.FC = () => {
    return (
        <section className="py-20 bg-white text-center">
            <h2 className="text-3xl font-bold text-black mb-4">
                Existing Blood Type
            </h2>
            <p className="text-gray-600 mb-10">Current blood reserve status</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-16 max-w-6xl mx-auto px-6">
                {bloodTypes.map((item) => (
                    <div
                        key={item.type}
                        className="bg-red-50 rounded-2xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition"
                    >
                        <Droplet className="text-red-500 w-10 h-10 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{item.type}</h3>
                        <p className="text-gray-600 text-sm mb-4">Blood type</p>

                        {/* Thanh progress */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                            <div
                                className="bg-red-500 h-2 transition-all duration-700 ease-in-out"
                                style={{ width: `${item.percent}%` }}
                            ></div>
                        </div>

                        <p className="text-sm text-gray-700">
                            Status:{" "}
                            <span className="text-green-600 font-semibold">{item.status}</span>
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BloodTypeSection;