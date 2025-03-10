


import useDynamicForm from "../components/useDynamicForm";
import { FieldConfig } from "../models/fieldConfig.interface";
import { customValidator } from "../utils/validator";
import { useAddCreatePatientMutation, useGetPatientByIdQuery, useUpdatePatientMutation, } from "../redux/apis/patientApi";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "../utils/toast";
import { idbHelpers } from "../indexDB";
import { io } from "socket.io-client"
import { format } from "date-fns";

const socket = io(import.meta.env.VITE_BACKEND_URL)

const defaultValues = {
    name: "",
    dateOfBirth: "",
    gender: "",
    contactInfo: "",
    email: "",
    age: "",
    weight: "",
    address: {
        city: "",
        state: "",
        country: "",
        street: "",
        zipCode: "",
    },

    emergencyContact: {
        name: "",
        relationship: "",
        contactNumber: "",
    },
};

const Patient = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [patient, setPatient] = useState<any | null>(null)

    const [addPatient, { isSuccess, isError }] = useAddCreatePatientMutation();

    const { data: patientData, isLoading, isFetching } = useGetPatientByIdQuery(id || "", {
        skip: !id || !navigator.onLine,
    })
    const [updatePatient, { data: updatedData, isSuccess: isUpdateSuccess }] = useUpdatePatientMutation()


    useEffect(() => {
        if (isSuccess) {
            toast.showSuccess("Patient Added Success")
            navigate("/patients")
        }

        if (isUpdateSuccess) {
            toast.showSuccess((updatedData as any)?.message)
        }
    }, [isSuccess, isUpdateSuccess])
    useEffect(() => {
        if (isError) {
            toast.showError("Patient Add Error")
        }
    }, [isError])

    const fields: FieldConfig[] = [

        {
            name: "name",
            label: "Name",
            type: "text",
            placeholder: "Enter Paitent Name",
            rules: { required: true },
        },
        {
            name: "dateOfBirth",
            label: "Date of Birth",
            type: "date",
            rules: { required: true },
        },
        {
            name: "gender",
            label: "Gender",
            type: "radio",
            options: [
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
            ],
            rules: { required: true },
        },

        {
            name: "contactInfo",
            label: "Contact Info",
            type: "text",
            rules: { required: true },
            placeholder: "Enter Contact Info "
        },
        {
            name: "email",
            label: "Email Address",
            type: "text",
            rules: { required: false, email: true },
            placeholder: "Enter Email Address"
        },
        {
            name: "age",
            label: "Age",
            type: "text",
            rules: { required: true },
            placeholder: "Enter Age"
        },
        {
            name: "weight",
            label: "Weight",
            type: "text",
            rules: { required: true },
            placeholder: "Enter Weight"
        },
        {
            name: "address",
            type: "formGroup",
            object: true,
            formGroup: {
                city: {
                    name: "city",
                    label: "City",
                    type: "text",
                    className: "sm:col-span-3 xl:col-span-2 mb-5",
                    rules: { required: true },
                    placeholder: "Enter City"
                },
                state: {
                    name: "state",
                    label: "State",
                    type: "text",
                    placeholder: "Enter amount",
                    className: "sm:col-span-3 xl:col-span-2 mb-5",
                    rules: { required: false },
                },
                country: {
                    name: "country",
                    label: "Country",
                    className: "sm:col-span-3 xl:col-span-2 mb-5",
                    type: "select",
                    options: [
                        { label: "Select Country", value: "", disabled: true },
                        { label: "India", value: 'india' },
                        { label: "United States", value: "United States" },
                        { label: "United Kingdom", value: "United Kingdom" },
                        { label: "Australia", value: "Australia" },
                    ],
                    rules: { required: false },
                },
                zipCode: {
                    name: "zipCode",
                    label: "Zip Code",
                    type: "text",
                    className: "sm:col-span-3 xl:col-span-2",
                    rules: { required: false },
                    placeholder: "Enter Zip Code"
                },
                street: {
                    name: "street",
                    label: "Street Address",
                    type: "textarea",
                    className: "sm:col-span-6 xl:col-span-4 mb-5 xl:mb-0",

                    rules: { required: false },
                    placeholder: "Enter Street Address"
                },
            },
            rules: {},
        },

        {
            name: "emergencyContact",
            displayName: "Emergency Contact",
            type: "formGroup",
            object: true,
            formGroup: {
                name: {
                    name: "name",
                    label: "Name",
                    type: "text",
                    className: "sm:col-span-3 xl:col-span-2 mb-5",
                    rules: { required: true },
                    placeholder: "Enter Name"
                },
                relationship: {
                    name: "relationship",
                    label: "Relationship",
                    className: "sm:col-span-3 xl:col-span-2 mb-5 xl:mb-0",
                    type: "text",
                    rules: { required: true },
                    placeholder: "Enter Relationship"
                },
                contactNumber: {
                    name: "contactNumber",
                    label: "Contact Number",
                    className: "sm:col-span-3 xl:col-span-2 mb-5 xl:mb-0",
                    type: "text",
                    rules: { required: true },
                    placeholder: "Enter Contact Number"
                },
            },
            rules: {},
        },

    ];

    const schema = customValidator(fields);
    const onSubmit = async (data: any) => {

        if (patient && patient._id) {
            if (navigator.onLine) {
                updatePatient({ updatepatient: data, updatedPatient: patient._id })
            } else {
                idbHelpers.update({ storeName: "patients", endpoint: "patient/patient-update", data, _id: patient._id })
            }
        } else {
            if (navigator.onLine) {
                addPatient(data)
                socket.emit("new-patient", data)
            } else {
                idbHelpers.add({ storeName: "patients", endpoint: "patient/patient-create", data })
            }
        }
    };

    useEffect(() => {
        if (id) {
            if (patientData) {
                setPatient(patientData);
            } else if (!navigator.onLine && !isFetching && !isLoading) {
                const fetchSupplier = async () => {
                    const offlineSupplier = await idbHelpers.get({ storeName: "patients", _id: id });

                    setPatient(offlineSupplier);
                };
                fetchSupplier();
            }
        }
    }, [id, patientData]);

    useEffect(() => {
        if (id && patient) {
            setValue("name", patient.name)
            if (patient.dateOfBirth) {
                const dateOfBirth = format(patient.dateOfBirth, "yyyy-MM-dd")
                setValue("dateOfBirth", dateOfBirth)
            }

            setValue("gender", patient?.gender)
            setValue("contactInfo", patient.contactInfo)
            setValue("email", patient.email)
            setValue("age", patient.age.toString() || "")
            setValue("weight", patient.weight.toString() || "")
            setValue("address.city", patient.address?.city);
            setValue("address.state", patient.address?.state || "");
            setValue("address.country", patient.address?.country || "");
            setValue("address.street", patient.address?.street || "");
            setValue("address.zipCode", patient.address?.zipCode || "");
            setValue("emergencyContact.name", patient.emergencyContact?.name || "");
            setValue("emergencyContact.relationship", patient.emergencyContact?.relationship || "");
            setValue("emergencyContact.contactNumber", patient.emergencyContact?.contactNumber || "");
        }

    },
        [patient])


    const { renderSingleInput, handleSubmit, reset, setValue, watch, disableField } = useDynamicForm({
        schema,
        fields,
        onSubmit,
        defaultValues,
    });

    const { dateOfBirth } = watch()

    useEffect(() => {
        if (dateOfBirth) {
            const birthDate = new Date(dateOfBirth)
            const today = new Date()
            const age = today.getFullYear() - birthDate.getFullYear()

            if (age) {
                setValue("age", age.toString())
                disableField("age", true)
            }
        }
    }, [dateOfBirth])

    return <>

        <div className="grid grid-cols-1 gap-x-8 gap-y-8">
            <div className="flex justify-between">
                <h2 className="text-lg font-bold text-gray-900">{id ? "Update Patient" : "Add Patient"}</h2>
                <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => navigate("/patients")}
                >
                    Back
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("name")}
                        </div>

                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("dateOfBirth")}
                        </div>


                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("contactInfo")}
                        </div>

                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("email")}
                        </div>

                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("age")}
                        </div>

                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("weight")}
                        </div>

                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("gender")}
                        </div>

                        <div className="sm:col-span-6">
                            {renderSingleInput("address")}
                        </div>

                        <div className="sm:col-span-6">
                            {renderSingleInput("emergencyContact")}
                        </div>


                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                    <button onClick={() => reset()} type="button" className="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Save
                    </button>
                </div>
            </form>


        </div >
    </>
};

export default Patient;
















