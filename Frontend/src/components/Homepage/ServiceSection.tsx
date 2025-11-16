import React, { useState } from "react";
import { Droplet, Heart, Clock } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

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

const ServiceCard: React.FC<{ 
    service: typeof services[0]; 
    index: number; 
    isVisible: boolean 
}> = ({ service, index, isVisible }) => {
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
            className={`bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 transform ${
                isVisible && animated
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-10 scale-95'
            }`}
        >
            <div className="bg-red-50 w-14 h-14 flex items-center justify-center rounded-xl mx-auto mb-6 group hover:bg-red-100 transition-all duration-300 hover:scale-110 hover:rotate-6 transform">
                <div className="group-hover:animate-pulse">
                    {service.icon}
                </div>
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
                {service.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{service.desc}</p>
            <a
                href="#"
                className="text-red-600 font-semibold hover:text-red-700 flex items-center justify-center gap-1 transition-all duration-300 group"
            >
                <span className="group-hover:translate-x-1 transition-transform">Learn more</span>
                <span className="group-hover:translate-x-2 transition-transform">→</span>
            </a>
        </div>
    );
};

const ServiceSection: React.FC = () => {
    const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

    return (
        <section ref={ref} className="py-20 bg-red-50">
            <div className="max-w-6xl mx-auto px-6 text-center">
                <div className={`transition-all duration-1000 ${
                    isVisible 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-10'
                }`}>
                    <h2 className="text-3xl font-bold text-black mb-2">Our Services</h2>
                    <p className="text-gray-600 mb-12">
                        We provide comprehensive services for blood donation and collection
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {services.map((service, index) => (
                        <ServiceCard 
                            key={index} 
                            service={service} 
                            index={index}
                            isVisible={isVisible}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServiceSection;