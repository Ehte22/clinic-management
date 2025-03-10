import { Link } from "react-router-dom";

const PageNotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-cyan-700">404</h1>
            <p className="text-xl text-gray-700 mt-4">Page Not Found</p>
            <p className="text-gray-500 mt-2 text-center">
                Sorry, the page you are looking for does not exist. <br />
                You can always go back to the home page.
            </p>
            <Link
                to="/"
                className="mt-6 px-6 py-2 text-white bg-cyan-700 hover:bg-cyan-700 rounded-full shadow-md transition-all"
            >
                Go Back Home
            </Link>
        </div>
    );
};

export default PageNotFound;
