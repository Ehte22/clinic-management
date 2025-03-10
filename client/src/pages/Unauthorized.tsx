import { Link } from "react-router-dom";

const Unauthorized = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-red-600">403</h1>
            <p className="text-xl text-gray-700 mt-4">Unauthorized Access</p>
            <p className="text-gray-500 mt-2 text-center">
                Sorry, you don't have permission to access this page. <br />
                Please contact an administrator if you believe this is a mistake.
            </p>
            <Link
                to="/"
                className="mt-6 px-6 py-2 text-white bg-red-600 hover:bg-red-700 rounded-full shadow-md transition-all"
            >
                Go Back Home
            </Link>
        </div>
    );
};

export default Unauthorized;
