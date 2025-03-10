import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

const Contact = () => {
    return <>
        <section id="contact" className="bg-gray-200 py-16 text-center">
            <div className="container mx-auto">
                <h3 className="text-3xl font-semibold mb-6 text-cyan-700">Contact Us</h3>
                <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-2 text-lg">
                        <FaMapMarkerAlt className="text-cyan-700" />
                        <span>Headquarters Location</span>
                    </div>
                    <div className="flex items-center space-x-2 text-lg">
                        <FaPhone className="text-cyan-700" />
                        <span>123-456-7890</span>
                    </div>
                    <div className="flex items-center space-x-2 text-lg">
                        <FaEnvelope className="text-cyan-700" />
                        <span>support@clinicplatform.com</span>
                    </div>
                </div>
            </div>
        </section>
    </>
};

export default Contact