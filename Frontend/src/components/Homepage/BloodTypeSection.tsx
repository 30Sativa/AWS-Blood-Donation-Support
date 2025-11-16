import React, { useState } from "react";
import { Droplet } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const bloodTypes = [
    { type: "A", status: "Stable", percent: 40 },
    { type: "B", status: "Stable", percent: 65 },
    { type: "AB", status: "Stable", percent: 80 },
    { type: "O", status: "Stable", percent: 75 },
];

const BloodTypeCard: React.FC<{ item: typeof bloodTypes[0]; index: number; isVisible: boolean }> = ({ 
    item, 
    index, 
    isVisible 
}) => {
    const [animated, setAnimated] = useState(false);

    React.useEffect(() => {
        if (isVisible && !animated) {
            const timer = setTimeout(() => {
                setAnimated(true);
            }, index * 150);
            return () => clearTimeout(timer);
        }
    }, [isVisible, index, animated]);

    return (
        <div
            className={`bg-red-50 rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-500 transform group ${
                isVisible && animated
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95'
            }`}
        >
            <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4 group-hover:animate-bounce transition-all">
                <Droplet className="text-red-500 w-10 h-10 mx-auto group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{item.type}</h3>
            <p className="text-gray-600 text-sm mb-4">Blood type</p>

            {/* Thanh progress */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                    style={{ 
                        width: animated ? `${item.percent}%` : '0%',
                    }}
                >
                    <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                </div>
            </div>

            <p className="text-sm text-gray-700">
                Status:{" "}
                <span className="text-green-600 font-semibold animate-pulse">{item.status}</span>
            </p>
        </div>
    );
};

const BloodTypeSection: React.FC = () => {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

    return (
        <section ref={ref} className="py-20 bg-white text-center">
            <div className={`transition-all duration-1000 ${
                isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
            }`}>
                <h2 className="text-3xl font-bold text-black mb-4">
                    Existing Blood Type
                </h2>
                <p className="text-gray-600 mb-10">Current blood reserve status</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-16 max-w-6xl mx-auto px-6">
                {bloodTypes.map((item, index) => (
                    <BloodTypeCard 
                        key={item.type} 
                        item={item} 
                        index={index}
                        isVisible={isVisible}
                    />
                ))}
            </div>
        </section>
    );
};

export default BloodTypeSection;