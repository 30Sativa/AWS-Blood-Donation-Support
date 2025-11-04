import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "../assets/HomePage/logo.jpg"; // đường dẫn logo, sửa theo folder của bạn

const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm relative top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center">
        {/* Left: logo */}
        <div className="flex items-center flex-1 gap-3">
          <img src={logo} alt="Blood Care Logo" className="w-10 h-10 object-contain" />
          <h1 className="text-xl md:text-2xl uppercase font-bold text-black">
            Blood Care
          </h1>
        </div>
        {/* Center: menu */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-8">
          <Link to="/" className="text-gray-900 hover:text-red-600 transition-colors">Home</Link>
          <Link to="/introduce" className="text-gray-900 hover:text-red-600 transition-colors">Introduce</Link>
          <Link to="/service" className="text-gray-900 hover:text-red-600 transition-colors">Service</Link>
          <Link to="/contact" className="text-gray-900 hover:text-red-600 transition-colors">Contact</Link>
          <Link to="/blog" className="text-gray-900 hover:text-red-600 transition-colors">Blog</Link>
        </nav>

        {/* Right: buttons */}
        <div className="flex-1 flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"
              asChild
            >
              <Link to="/login">Log in</Link>
            </Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" asChild>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
