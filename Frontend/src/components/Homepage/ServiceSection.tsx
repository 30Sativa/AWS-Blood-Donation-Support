import React from "react";
import { Droplet, Heart, Clock } from "lucide-react";

const services = [
    {
        icon: <Droplet className="text-red-500 w-8 h-8" />,
        title: "Blood Donation",
        desc: "Register to donate blood easily and safely. Professional process, ensuring the health of the donor.",
    },
    {
        icon: <Heart className="text-red-500 w-8 h-8" />,
        title: "Receive Blood",
        desc: "Search and request emergency blood. A system that quickly connects people in need with those who have it.",
    },
    {
        icon: <Clock className="text-red-500 w-8 h-8" />,
        title: "24/7 Emergency",
        desc: "24/7 Blood Emergency Service. Always ready to assist in the most urgent cases.",
    },
];

const ServiceSection: React.FC = () => {
    return (
        <section className="py-20 bg-red-50">
            {/* Đã thay đổi max-w-7xl thành max-w-6xl để khối nội dung cô đọng hơn */}
            <div className="max-w-6xl mx-auto px-6 text-center"> 
                <h2 className="text-3xl font-bold text-black mb-2">Our Services</h2>
                <p className="text-gray-600 mb-12">
                    We provide comprehensive services for blood donation and collection
                </p>

                {/* Giữ nguyên grid và gap-8 đã được tối ưu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"> 
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all"
                        >
                            {/* ... (Giữ nguyên nội dung service card) ... */}
                            <div className="bg-red-50 w-14 h-14 flex items-center justify-center rounded-xl mx-auto mb-6">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-black mb-2">
                                {service.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">{service.desc}</p>
                            <a
                                href="#"
                                className="text-red-600 font-semibold hover:underline flex items-center justify-center gap-1"
                            >
                                Learn more →
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServiceSection;