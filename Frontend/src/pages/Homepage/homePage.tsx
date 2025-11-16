import React from "react";
import Introduction from "../../components/Homepage/Introduction";
import BloodTypeSection from "../../components/Homepage/BloodTypeSection";
import ServiceSection from "../../components/Homepage/ServiceSection";
import WhyDonateSection from "../../components/Homepage/WhyDonateSection";
import HeroCTA from "../../components/Homepage/HeroCTA";

const HomePage: React.FC = () => {
    return (
        <div className="overflow-x-hidden">
            <Introduction />
            <BloodTypeSection />
            <ServiceSection />
            <WhyDonateSection />
            <HeroCTA />
        </div>
    );
};

export default HomePage;
