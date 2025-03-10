const About = () => {
    return <>
        <section id="about" className="container mx-auto py-20 text-center px-4 md:px-12 lg:px-20">
            <h3 className="text-3xl font-semibold mb-6">About Us</h3>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-4">
                Our platform is built to empower clinic owners by providing seamless registration and enhanced online presence. With our subscription model, clinics can easily manage their services and attract more patients.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h4 className="text-xl font-bold text-cyan-700">Easy Registration</h4>
                    <p className="text-gray-600 mt-2">Clinics can quickly register on our platform and start managing their subscriptions hassle-free.</p>
                </div>
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h4 className="text-xl font-bold text-cyan-700">Powerful Tools</h4>
                    <p className="text-gray-600 mt-2">Get access to tools that help clinics enhance their management and visibility.</p>
                </div>
                <div className="p-6 bg-white shadow-md rounded-lg">
                    <h4 className="text-xl font-bold text-cyan-700">Seamless Growth</h4>
                    <p className="text-gray-600 mt-2">Expand your reach and grow your clinic efficiently with our intuitive platform.</p>
                </div>
            </div>
        </section>
    </>
};

export default About