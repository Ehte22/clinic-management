
import { useEffect, useState } from "react";
import { useCreatePrescriptionMutation } from "../../redux/apis/prescriptionApi";
import { Patient, useGetAllAllPatientQuery } from "../../redux/apis/patientApi";
import { GETDATA, useGetAllMedicinesQuery } from "../../redux/apis/medicineApi";
import { FieldConfig } from "../../models/fieldConfig.interface";
import { toast } from "../../utils/toast";
import { customValidator } from "../../utils/validator";
import useDynamicForm from "../../components/useDynamicForm";
import Modal from "./Modal";
import PrescriptionTable from "../../components/patient/PrescriptionTable";
import { idbHelpers } from "../../indexDB";
import { io } from "socket.io-client"

const socket = io(import.meta.env.VITE_BACKEND_URL, {
    transports: ["polling"]
})

const defaultValues = {
    patient: "",
    doctor: "",
    medical: [{
        medicine: "",
        dosage: "",
        duration: "",
        frequency: "",
        tests: "",
        instructions: "",
        quantity: "",

    }],
    complete: "",
    note: "",
    add: "",
    pa: "",
    cvs: "",
    pulse: "",
    diagnost: "",
    rs: "",
    bp: "",
    temp: "",
    weight: "",
    age: ""

};

const Prescription = () => {

    const [transformedPatients, setTransformedPatients] = useState<{ label: string, value: string, disabled?: boolean }[]>([
        { label: "Select Patient", value: "", disabled: true }
    ]);

    const [medicineOptions, setMedicineOptions] = useState<{ label: string, value: string, disabled?: boolean }[]>([
        { label: "Select Doctor Name", value: "", disabled: true }
    ]);
    const [medicineData, setMedicineData] = useState<GETDATA>();
    const [patient, setPatient] = useState<Patient>()


    const [addPrescription, { isSuccess, isError, }] = useCreatePrescriptionMutation()

    const { data: allPatients, isSuccess: patientGetSuccess } = useGetAllAllPatientQuery({ isFetchAll: true })
    const { data: allMedicines, isSuccess: medicineSuccess } = useGetAllMedicinesQuery({ isFetchAll: true })

    const fields: FieldConfig[] = [
        {
            name: "patient",
            label: "Patient",
            type: "select",
            options: transformedPatients,
            rules: { required: true },
        },
        {
            name: "age",
            label: "Age",
            type: "text",
            placeholder: "Enter Age",
            rules: { required: true },
        },
        {
            name: "weight",
            label: "Weight",
            type: "text",
            placeholder: "Enter Weight",
            rules: { required: true },
        },
        {
            name: "medical",
            type: "formArray",
            className: "border px-4 py-6 sm:p-8 my-4",
            object: true,
            formArray: [
                {
                    name: "medicine",
                    label: "Medicine",
                    placeholder: "Enter Medicine Name",
                    type: "text",
                    className: "sm:col-span-6 md:col-span-4 xl:col-span-3",
                    rules: { required: true },
                },
                {
                    name: "dosage",
                    label: "Dosage",
                    placeholder: "Enter Dosage",
                    type: "text",
                    className: "sm:col-span-6 md:col-span-4 xl:col-span-3",
                    rules: { required: true },
                },
                {
                    name: "frequency",
                    label: "Frequency",
                    type: "checkbox",
                    className: "sm:col-span-12 md:col-span-8 xl:col-span-6",
                    options: [
                        { label: "Morning", value: "Morning", className: "col-span-6 sm:col-span-3" },
                        { label: "Afternoon", value: "Afternoon", className: "col-span-6 sm:col-span-3" },
                        { label: "Evening", value: "Evening", className: "col-span-6 sm:col-span-3" },
                        { label: "Night", value: "Night", className: "col-span-6 sm:col-span-3" },
                    ],
                    rules: { required: true, checkbox: true },
                },

                {
                    name: "quantity",
                    label: "Quantity",
                    placeholder: "Enter Quantity",
                    type: "number",
                    className: "sm:col-span-6 md:col-span-4 xl:col-span-3",
                    rules: { required: true },
                },
                {

                    name: "tests",
                    label: "TestName",
                    placeholder: "Enter Test Name",
                    type: "text",
                    className: "sm:col-span-6 md:col-span-4 xl:col-span-3",
                    rules: { required: false },
                },
                {
                    name: "instructions",
                    label: "Instructions",
                    type: "select",
                    className: "sm:col-span-6 md:col-span-4 xl:col-span-3",
                    options: [
                        { label: "Select Meal", value: "", disabled: true },
                        { label: "Before Meal", value: "Before Meal" },
                        { label: "After Meal", value: "After Meal" },
                        { label: "Without Meal", value: "Without Meal" },
                    ],
                    rules: { required: true, },
                },


                {
                    name: "duration",
                    label: "Duration",
                    placeholder: "Enter Duration",
                    type: "number",
                    className: "sm:col-span-6 md:col-span-4 xl:col-span-3",
                    rules: { required: true },
                },
                // {
                //     name: "duration",
                //     label: "Duration",
                //     type: "checkbox",
                //     className: "sm:col-span-12 md:col-span-8 xl:col-span-6",
                //     options: [
                //         { label: " Daily Morning", value: "Morning", className: "col-span-6 sm:col-span-3" },
                //         { label: "Afternoon", value: "Afternoon", className: "col-span-6 sm:col-span-3" },
                //         { label: "Evening", value: "Evening", className: "col-span-6 sm:col-span-3" },
                //         { label: "Night", value: "Night", className: "col-span-6 sm:col-span-3" },
                //     ],
                //     rules: { required: true, checkbox: true },
                // },


            ],
            rules: {}
        },

        {
            name: "cvs",
            label: "CVS",
            placeholder: "Enter CVS",
            type: "text",
            rules: { required: false },
        },
        {
            name: "pulse",
            label: "Pulse",
            placeholder: "Enter Pulse",
            type: "number",
            rules: { required: false },
        },
        {
            name: "bp",
            label: "BP",
            placeholder: "Enter BP",
            type: "text",
            rules: { required: false },
        },
        {
            name: "temp",
            label: "Temp",
            placeholder: "Enter Temperature",
            type: "number",
            rules: { required: false },
        },
        {
            name: "pa",
            label: "PA",
            placeholder: "Enter PA",
            type: "number",
            rules: { required: false },
        },
        {
            name: "rs",
            label: "RS",
            placeholder: "Enter RS",
            type: "text",
            rules: { required: false },
        },
        {
            name: "complete",
            label: "Complete",
            placeholder: "Enter Text",
            type: "textarea",
            rules: { required: false },
        },
        {
            name: "diagnost",
            label: "Diagnost",
            placeholder: "Enter Text",
            type: "textarea",
            rules: { required: false },
        },
        {
            name: "note",
            label: "Notes",
            placeholder: "Enter Text",
            type: "textarea",
            rules: { required: false },
        },


    ];


    const schema = customValidator(fields);


    const onSubmit = (data: any) => {
        const prescription = allPatients?.result?.find(item => item?.name === data?.patient)


        let updatePatient = data
        updatePatient = { ...data, patient: prescription?._id }
        if (navigator.onLine) {
            addPrescription(updatePatient)
        } else {
            idbHelpers.add({ storeName: "prescriptions", endpoint: "prescription/create", data: updatePatient })
        }
    };


    const { renderSingleInput, handleSubmit, setValue, watch, reset } = useDynamicForm({ schema, fields, onSubmit, defaultValues })


    const [open, setOpen] = useState(false);

    // const { toPDF, targetRef } = usePDF({ filename: "prescription.pdf" });
    const values = watch()

    useEffect(() => {
        if (Array.isArray(allPatients?.result) && patientGetSuccess) {
            const patients = allPatients.result.map((patient: any) => {
                return { label: patient.name, value: patient.name }
            });

            setTransformedPatients([...transformedPatients, ...patients])
        }
    }, [allPatients, patientGetSuccess]);

    useEffect(() => {
        socket.on("update-patients", (data) => {
            const newPatient = { label: data.name, value: data.name };
            setTransformedPatients((prev) => [...prev, newPatient])
        })

        return () => {
            socket.off("update-patients")
        }
    }, [])

    useEffect(() => {
        if (allMedicines) {
            setMedicineData(allMedicines)
        }
    }, [allMedicines, medicineData])

    useEffect(() => {
        if (isSuccess) {
            toast.showSuccess("Prescription Added Successfully")
            reset()
        }
    }, [isSuccess])

    useEffect(() => {
        if (isError) {
            toast.showError("Prescription Added Failed")
        }
    }, [isError])

    useEffect(() => {
        if (allMedicines && medicineSuccess) {
            const medicine = allMedicines?.result.map((medicine: any) => {

                return {

                    label: `${medicine.medicineName} (${medicine._id})`,
                    value: medicine._id
                };
            });

            const y = [...medicineOptions, ...medicine];
            setMedicineOptions(y);
        }
    }, [allMedicines, medicineSuccess]);

    useEffect(() => {
        if (values.patient) {
            const patient = allPatients?.result.find(item => item.name === values.patient)

            if (patient) {
                setValue("age", patient.age.toString() || "")
                setValue("weight", patient.weight.toString() || "")
            }

            setPatient(patient)

        }
    }, [values.patient])

    return (
        <>

            <div className="grid grid-cols-1 gap-x-8 gap-y-8">
                <div className="flex justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Prescription</h2>
                    <button
                        type="button"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={() => setOpen(true)}
                    >
                        Add
                    </button>
                </div>


                {open && <Modal setValue={setValue} medicineData={medicineData} open={open} setOpen={setOpen} />}

                <form onSubmit={handleSubmit(onSubmit)}
                    className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    <div className="px-4 py-6 sm:p-8">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("patient")}</div>
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("age")}</div>
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("weight")}</div>

                            <div className="sm:col-span-12">{renderSingleInput("medical")}</div>
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("bp")}</div>
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("temp")}</div>
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("rs")}</div>
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("cvs")}</div>
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("pa")}</div>
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("pulse")}</div>


                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("complete")}</div>
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("diagnost")}</div>
                            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("note")}</div>

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

            {
                values.patient && <PrescriptionTable allMedicines={watch("medical")} patientData={patient} />
            }
        </>
    );
};

export default Prescription;
