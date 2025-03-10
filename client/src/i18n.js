import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            patient_prescription: "Patient Prescription Table",
            name: "Name",
            contactInfo: "Contact Info",
            dateOfBirth: "Date of Birth",
            gender: "Gender",
            Sr_No: "Sr No",
            Medicine_Name: "Medicine Name",
            Dose: "Dose",
            dose: "{{value}} Tablets",


            Duration: "Duration",
            duration: "{{value}} for each day",
            Instructions: "Instructions",
            Quantity: "Quantity",
            quantity: "{{value}} pills",
            print: "Print",
            "Before Meal": "Before Meal",
            "After Meal": "After Meal",
            "Without Meal": "Without Meal",

            Frequency: "Frequency",
            frequency: "{{value}} ",
            "Morning": "Morning",
            "Afternoon": "Afternoon",
            "Evening": "Evening",
            "Night": "Night",

            "1": "One Every Day",
            "2": "Two Every Day",
            "3": "Three Every Day",
            "4": "Four Every Day",



        }
    },
    mr: {
        translation: {
            dose: "{{value}} टॅब्लेट",
            print: "छापून काढा",
            quantity: "{{value}} गोळ्या",
            print: "छापून काढा",

            "After Meal": "जेवणानंतर",
            "Without Meal": "जेवणकरण्यापूर्वी",
            "Before Meal": "जेवणापूर्वी",

            duration: "{{value}} दिवसांसाठी",

            frequency: "{{value}}",
            "Morning": "रोजसकाळी",
            "Afternoon": "रोजदुपारी",
            "Evening": "रोजसंध्याकाळी",
            "Night": "रोजरात्री",
            "1": "एकदा दररोज",
            "2": "दोनदा दररोज",
            "3": "तीनदा दररोज",
            "4": "चारदा दररोज",


        }
    }
};

i18n.use(initReactI18next).init({
    resources,
    lng: "mr", // Default language
    fallbackLng: "en",
    interpolation: {
        escapeValue: false
    }
});

export default i18n;
