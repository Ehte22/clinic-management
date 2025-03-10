const Hero = () => {
    const handleRegisterClick = () => {
        const element = document.getElementById("subscription");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return <>
        <header id="hero"
            className="relative text-white py-48 text-center bg-cover bg-center px-4 md:px-12 lg:px-20"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=800&q=80')" }}
        >
            <div className="absolute inset-0 bg-black opacity-30"></div>
            <h2 className="text-5xl font-bold relative ">Grow Your Clinic with Us</h2>
            <p className="mt-4 text-lg relative ">Join our platform and get more visibility for your clinic.</p>
            <button className="mt-6 bg-white text-cyan-700 px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition relative"
                onClick={handleRegisterClick}>
                Register Your Clinic
            </button>
        </header>
    </>
};

export default Hero