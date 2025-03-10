import React from "react";
import { useTranslation } from "react-i18next";
import { usePDF } from "react-to-pdf";
import { Patient } from "../../redux/apis/patientApi";
import i18n from 'i18next';
import { format } from "date-fns";

const convertToMarathiNumerals = (number: number) => {
    const marathiNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '10'];
    if (number >= 1 && number <= 100) {
        return number.toString().split('').map(digit => marathiNumerals[parseInt(digit)]).join('');
    }

    return number
        .toString()
        .split('')
        .map(digit => marathiNumerals[parseInt(digit)])
        .join('');
};

interface PrescriptionTableProps {
    allMedicines: Medicine[],
    patientData?: Patient
}
interface Medicine {
    dosage: number
    medicine: string,
    frequency: number,
    instructions: string,
    duration: number,
    quantity: number,
}

const PrescriptionTable: React.FC<PrescriptionTableProps> = ({ allMedicines, patientData }) => {
    const { t } = useTranslation();
    const { targetRef } = usePDF({ filename: "prescription.pdf" });

    const toggleLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <>
            <div className="flex justify-end mb-2 mt-5">
                <button
                    onClick={() => toggleLanguage("en")}
                    className="mr-2 px-4 py-2 mt-5 bg-blue-600 text-white rounded"
                >
                    English
                </button>
                <button onClick={() => toggleLanguage("mr")} className="px-4 py-2 mt-5 bg-green-600 text-white rounded">
                    मराठी
                </button>
            </div>


            <button
                type="submit"
                // onClick={() => toPDF()}
                className="rounded-md bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
            >
                {t("print")}
            </button>
            <div ref={targetRef}>
                <div>
                    {/* <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h1 className="text-base font-semibold text-gray-900">Patient Prescription Table</h1>
                        </div>
                    </div> */}

                    {patientData && (
                        <div className="mt-4">
                            <h1><strong>Name:</strong>  {patientData.name}</h1>
                            <h1><strong>Contact Info:</strong>  {patientData.contactInfo}</h1>
                            <h1><strong>Date of Birth:</strong>  {format(patientData.dateOfBirth, "dd-MM-yyyy")}</h1>
                            <h1><strong>Gender:</strong>  {patientData.gender}</h1>
                        </div>
                    )}

                    <div className="mt-8 flow-root">
                        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8 font-sans">

                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-white">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                {t("Sr_No")}
                                            </th>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                {t("Medicine_Name")}
                                            </th>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                {t("Dose")}
                                            </th>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                {t("Frequency")}
                                            </th>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                {t("Duration")}
                                            </th>

                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                {t("Instructions")}
                                            </th>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                                {t("Quantity")}
                                            </th>
                                        </tr>
                                    </thead>
                                    {patientData && (
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {allMedicines && allMedicines.map((item, index) => (
                                                <tr key={index} >
                                                    <td className="pl-4 pr-3 whitespace-nowrap py-5 text-sm text-gray-500">
                                                        {i18n.language === "mr" ? convertToMarathiNumerals(index + 1) : index + 1}
                                                    </td>
                                                    <td className="pl-4 pr-3 whitespace-nowrap py-5 text-sm text-gray-500">
                                                        {item.medicine || (i18n.language === "mr" ? "न/अ" : "N/A")}
                                                    </td>


                                                    <td className="pl-4 pr-3 whitespace-nowrap py-5 text-sm text-gray-500">
                                                        {item.dosage
                                                            ? i18n.language === "mr"
                                                                ? t("dose", { value: convertToMarathiNumerals(item.dosage) })
                                                                : t("dose", { value: item.dosage })
                                                            : i18n.language === "mr"
                                                                ? "न/अ"
                                                                : "N/A"}
                                                    </td>
                                                    {/* <td className="pl-4 pr-3 whitespace-nowrap py-5 text-sm text-gray-500">
                                                            {item.frequency
                                                                ? `${t(String(item.frequency).trim())} ${t("frequency", { value: "" })}`
                                                                : t("frequency", { value: "" })}
                                                        </td> */}
                                                    <td className="pl-4 pr-3 whitespace-nowrap py-5 text-sm text-gray-500">
                                                        {Array.isArray(item.frequency) && item.frequency.length > 0
                                                            ? item.frequency.map(f => t(String(f))).join(", ")
                                                            : t("N/A", { defaultValue: "न/अ" })}
                                                    </td>



                                                    <td className="pl-4 pr-3 whitespace-nowrap py-5 text-sm text-gray-500">
                                                        {item.duration
                                                            ? i18n.language === "mr"
                                                                ? t("duration", { value: convertToMarathiNumerals(item.duration) })
                                                                : t("duration", { value: item.duration })
                                                            : i18n.language === "mr"
                                                                ? "न/अ"
                                                                : "N/A"}
                                                    </td>
                                                    <td className="pl-4 pr-3 whitespace-nowrap py-5 text-sm text-gray-500">
                                                        {item.instructions
                                                            ? t(item.instructions)
                                                            : (i18n.language === "mr" ? "न/अ" : "N/A")}
                                                    </td>

                                                    <td className="pl-4 pr-3 whitespace-nowrap py-5 text-sm text-gray-500">
                                                        {item.quantity
                                                            ? i18n.language === "mr"
                                                                ? t("quantity", { value: convertToMarathiNumerals(item.quantity) })
                                                                : t("quantity", { value: item.quantity })
                                                            : i18n.language === "mr"
                                                                ? "न/अ"
                                                                : "N/A"}
                                                    </td>


                                                </tr>
                                            ))}
                                        </tbody>
                                    )}
                                </table>

                            </div>
                        </div>
                    </div>

                </div>
            </div >
        </>
    );
};

export default PrescriptionTable;






