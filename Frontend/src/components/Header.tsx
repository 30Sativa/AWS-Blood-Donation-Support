import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Header = () => {
    return (
        <div className="p-4 bg-white flex items-center">
            <div className="flex-1">
                <h1 className="text-[40px] uppercase font-bold text-red-700">Blood Care</h1>
            </div>
            <div className="flex-1 flex items-center justify-center">
            <nav className="flex items-center space-x-4">
                <Link to="/" className="text-gray-900 hover:text-red-600 transition-colors">Home</Link>
                <Link to="/introduce" className="text-gray-900 hover:text-red-600 transition-colors">Introduce</Link>
                <Link to="/service" className="text-gray-900 hover:text-red-600 transition-colors">Service</Link>
                <Link to="/contact" className="text-gray-900 hover:text-red-600 transition-colors">Contact</Link>
                <Link to="/blog" className="text-gray-900 hover:text-red-600 transition-colors">Blog</Link>
            </nav>
        </div>

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
    )
    
}

export default Header;