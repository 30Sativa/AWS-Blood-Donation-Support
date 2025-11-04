import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo description */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-red-600">BLOOD CARE</h2>
                        <p className="text-gray-400 text-sm">
                            Save lives with every drop of blood you donate.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-red-600 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/introduce" className="text-gray-400 hover:text-red-600 transition-colors">
                                    Introduce
                                </Link>
                            </li>
                            <li>
                                <Link to="/service" className="text-gray-400 hover:text-red-600 transition-colors">
                                    Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="text-gray-400 hover:text-red-600 transition-colors">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Services</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li>Blood Donation</li>
                            <li>Blood Request</li>
                            <li>Emergency Support</li>
                            <li>Health Check</li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">123 Main Street, City, Country</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm">+84 123 456 789</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">info@bloodcare.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; 2024 Blood Care. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;