import React, { useState } from "react";
import { Heart, ShieldCheck, Activity } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const reasons = [
    {
        icon: <Heart className="text-white w-6 h-6" />,
        title: "Save Others",
        desc: "Each blood donation can save up to 3 lives. Your small actions make a big difference.",
    },
    {
        icon: <ShieldCheck className="text-white w-6 h-6" />,
        title: "Safety & Security",
        desc: "The blood donation process is strictly controlled, ensuring absolute safety for the donor.",
    },
    {
        icon: <Activity className="text-white w-6 h-6" />,
        title: "Health Benefits",
        desc: "Regular blood donation reduces the risk of heart disease and improves overall health.",
    },
];

const ReasonItem: React.FC<{ 
    reason: typeof reasons[0]; 
    index: number; 
    isVisible: boolean 
}> = ({ reason, index, isVisible }) => {
    const [animated, setAnimated] = useState(false);

    React.useEffect(() => {
        if (isVisible && !animated) {
            const timer = setTimeout(() => {
                setAnimated(true);
            }, index * 200);
            return () => clearTimeout(timer);
        }
    }, [isVisible, index, animated]);

    return (
        <div 
            className={`flex items-start gap-4 transition-all duration-700 ${
                isVisible && animated
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-10'
            }`}
        >
            <div className="bg-white/20 p-3 rounded-xl group-hover:bg-white/30 transition-all duration-300 hover:scale-110 hover:rotate-6 transform">
                <div className="group-hover:animate-pulse">
                    {reason.icon}
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-lg">{reason.title}</h3>
                <p className="text-white/90 text-sm">{reason.desc}</p>
            </div>
        </div>
    );
};

const WhyDonateSection: React.FC = () => {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });
    const { ref: rightRef, isVisible: rightVisible } = useScrollAnimation({ threshold: 0.2 });

    return (
        <section ref={ref} className="bg-red-700 text-white py-12">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-16">
                {/* Bên trái - Lý do */}
                <div className="md:w-2/3 space-y-6">
                    <div className={`transition-all duration-1000 ${
                        isVisible 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-10'
                    }`}>
                        <h2 className="text-3xl font-bold mb-6">Why Should You Donate Blood?</h2>
                    </div>
                    <div className="space-y-6">
                        {reasons.map((reason, index) => (
                            <ReasonItem 
                                key={index} 
                                reason={reason} 
                                index={index}
                                isVisible={isVisible}
                            />
                        ))}
                    </div>
                </div>

                {/* Bên phải - Điều kiện hiến máu */}
                <div 
                    ref={rightRef}
                    className={`md:w-1/3 bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg transition-all duration-1000 hover:bg-white/30 hover:scale-105 transform ${
                        rightVisible 
                            ? 'opacity-100 translate-x-0' 
                            : 'opacity-0 translate-x-10'
                    }`}
                >
                    <h3 className="text-xl font-semibold mb-4">Blood Donation Conditions</h3>
                    <ul className="space-y-3 text-white/90 text-sm list-disc pl-5">
                        <li className="hover:text-white transition-colors">Age: 18–60 years old</li>
                        <li className="hover:text-white transition-colors">Weight: Minimum 45kg</li>
                        <li className="hover:text-white transition-colors">Good health, no chronic diseases</li>
                        <li className="hover:text-white transition-colors">Do not use antibiotics</li>
                        <li className="hover:text-white transition-colors">Not pregnant or breastfeeding</li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default WhyDonateSection;
