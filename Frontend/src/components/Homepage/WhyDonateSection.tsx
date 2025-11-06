import React from "react";
import { Heart, ShieldCheck, Activity } from "lucide-react";

const reasons = [
    {
        icon: <Heart className="text-white w-6 h-6" />,
        title: "Save Others",
        desc: "Each blood donation can save up to 3 lives. Your small actions make a big difference.",
    },
    {
        icon: <ShieldCheck className="text-white-500 w-6 h-6" />,
        title: "Safety & Security",
        desc: "The blood donation process is strictly controlled, ensuring absolute safety for the donor.",
    },
    {
        icon: <Activity className="text-white-500 w-6 h-6" />,
        title: "Health Benefits",
        desc: "Regular blood donation reduces the risk of heart disease and improves overall health.",
    },
];

const WhyDonateSection: React.FC = () => {
    return (
        <section className="bg-red-700 text-white py-12">
            {/* Giữ nguyên max-w-6xl. Giảm gap từ gap-16 xuống gap-10. */}
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-10"> 
                
                {/* Bên trái - Lý do (Đã chỉnh w-2/3 -> w-7/12 (khoảng 58%)) */}
                <div className="md:w-7/12 space-y-6"> 
                    <h2 className="text-3xl font-bold mb-6">Why Should You Donate Blood?</h2>
                    <div className="space-y-6">
                        {reasons.map((reason, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="bg-white/20 p-3 rounded-xl">{reason.icon}</div>
                                <div>
                                    <h3 className="font-semibold text-lg">{reason.title}</h3>
                                    <p className="text-white/90 text-sm">{reason.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bên phải - Điều kiện hiến máu (Đã chỉnh w-1/3 -> w-5/12 (khoảng 42%)) */}
                <div className="md:w-5/12 bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Blood Donation Conditions</h3>
                    <ul className="space-y-3 text-white/90 text-sm list-disc pl-5">
                        <li>Age: 18–60 years old</li>
                        <li>Weight: Minimum 45kg</li>
                        <li>Good health, no chronic diseases</li>
                        <li>Do not use antibiotics</li>
                        <li>Not pregnant or breastfeeding</li>
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default WhyDonateSection;