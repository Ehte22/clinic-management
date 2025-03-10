import { useNavigate } from "react-router-dom";

const Subscription = () => {
    const navigate = useNavigate()

    return <>
        <section id="subscription" className="container mx-auto py-20 text-center px-4 md:px-12 lg:px-20">
            <h3 className="text-3xl font-semibold mb-6">Register Your Clinic</h3>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-4">
                Subscribe to our platform and gain access to premium tools that enhance your clinic’s management and patient engagement.
            </p>
            <button onClick={() => navigate("/register-clinic")} className="bg-cyan-700 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-cyan-800 transition">
                Get Started
            </button>
        </section>
    </>
};

export default Subscription