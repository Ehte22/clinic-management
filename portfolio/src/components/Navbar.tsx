import { Link } from "react-router-dom";

const Navbar = () => {
    return <>
        <nav className="bg-cyan-700 px-4 md:px-12 lg:px-20 shadow-lg fixed w-full z-10">
            <div className="py-5 mx-auto flex items-center justify-between">
                <div className="text-white text-xl font-bold">
                    <div>Clinic Subscription</div>
                </div>

                <div className="lg:flex space-x-4">
                    <Link to="/" className="text-white hover:text-gray-200">
                        Home
                    </Link>
                    <Link to="/register-clinic" className="text-white hover:text-gray-200">
                        Register
                    </Link>
                </div>
            </div>
        </nav >
    </>
};

export default Navbar