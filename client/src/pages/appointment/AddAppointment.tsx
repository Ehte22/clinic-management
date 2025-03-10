import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ValidationRules } from '../../models/validationRules.interface';
import { useCreateAppointmentMutation, useGetAppointmentByIdQuery, useUpdateAppointmentMutation } from '../../redux/apis/appointment.api';
import { useGetAllAllPatientQuery } from '../../redux/apis/patientApi';
import { useSearchDoctorQuery } from '../../redux/apis/doctor.api';
import { FieldConfig } from '../../models/fieldConfig.interface';
import { customValidator } from '../../utils/validator';
import useDynamicForm from '../../components/useDynamicForm';
import { toast } from '../../utils/toast';
import { idbHelpers } from '../../indexDB';




const defaultValues = {
    date: "",
    reason: "",
    phone: "",
    notes: "",
    doctor: "",
    patient: "",
    label: "",
    patientType: "",
    timeSlot: {
        from: "",
        to: "",
    },
    payment: {
        method: "cash",
        amount: "",
        status: "unpaid",
        patientType: "new",
    },
    button: ""
}

export interface ExtractedRule {
    name: string;
    rules: ValidationRules | ExtractedRule[];
}
const AddAppointment = () => {
    const [appointment, setAppointment] = useState<any | null>(null)
    const [addAppointment, { isSuccess: addsuccess, isError: addIsError, error: adderror }] = useCreateAppointmentMutation()
    const { data: patients } = useGetAllAllPatientQuery({ isFetchAll: true })
    const { data: doctors } = useSearchDoctorQuery({ query: "", page: 1, limit: 1000 })
    const [doctorOptions, setDoctorOptions] = useState<{ label: string; value: string }[]>([]);
    const [patinetOptions, setPatinetOptions] = useState<{ label: string; value: string }[]>([]);
    const { id } = useParams()
    const { data: appointmentData } = useGetAppointmentByIdQuery(id as string || "", {
        skip: !id || !navigator.onLine,
    })
    const [updateAppointment, { isSuccess: updateSuccess, isError: updateIserror, error: Updateerror }] = useUpdateAppointmentMutation()
    const navigate = useNavigate()
    const onSubmit = (values: FormValues) => {
        let updatedValues: Record<string, any> = {};

        Object.keys(values).forEach((key) => {
            if (key === "qualifications") {
                if (values[key].length > 1) {
                    updatedValues[key] = values[key];
                } else {
                    updatedValues[key] = values[key];
                }
            } else if (key === "experience") {
                updatedValues[key] = values[key].map((item: Record<string, string>, index: number) => {
                    return Object.keys(item).reduce((acc, subKey) => {
                        acc[`${key}[${index}][${subKey}]`] = item[subKey];
                        return acc;
                    }, {} as Record<string, string>);
                });
            } else if (key === "profile") {
                updatedValues[key] = values.profile;
            } else {
                updatedValues[key] = values[key];
            }
        });
        const result = doctors?.result?.find(item => item.doctor?.firstName === values.doctor)
        const patient = patients?.result?.find(item => item.name === values.patient)
        updatedValues = { ...updatedValues, ...values, doctor: result?._id, patient: patient?._id }

        if (appointment && appointment._id) {
            if (navigator.onLine) {
                updateAppointment({ appointmentData: updatedValues, id: appointment._id })
            } else {
                idbHelpers.update({ storeName: "appointments", endpoint: "appointment/update", data: updatedValues, _id: appointment._id })
            }
        } else {
            if (navigator.onLine) {
                addAppointment(updatedValues);
            } else {
                idbHelpers.add({ storeName: "appointments", endpoint: "appointment/create", data: updatedValues })
            }
        }

    };

    useEffect(() => {
        if (id) {
            if (appointmentData && navigator.onLine) {
                setAppointment(appointmentData.result);
            } else {
                const fetchSupplier = async () => {
                    const offlineSupplier = await idbHelpers.get({ storeName: "appointments", _id: id });

                    setAppointment(offlineSupplier);
                };
                fetchSupplier();
            }
        }
    }, [id, appointmentData]);

    useEffect(() => {
        if (addsuccess) {
            navigate("/appointment")
        }
    }, [addsuccess]);

    useEffect(() => {
        if (updateSuccess) {
            navigate("/appointment")
        }
    }, [updateSuccess]);

    useEffect(() => {
        if (doctors) {
            const doctorData = doctors?.result.map((element: any) => ({
                label: element.doctor?.firstName,
                value: element.doctor?.firstName,
            }));

            setDoctorOptions(doctorData);
        }
    }, [doctors]);

    useEffect(() => {
        if (patients) {


            const patientData = patients.result?.map((element: any) => ({
                label: element.name,
                value: element.name,
            }));
            setPatinetOptions(patientData);
        }
    }, [doctors, patients]);

    const fields: FieldConfig[] = [
        {
            name: "date",
            label: "Date",
            type: "date",
            placeholder: "Enter your Date",
            rules: { required: true, min: 2, max: 16 }
        },
        {
            name: "label",
            label: "Label",
            type: "text",
            placeholder: "Enter your Label",
            rules: { required: false, min: 2, max: 16 }
        },
        {
            name: "reason",
            label: "Reason",
            type: "text",
            placeholder: "Enter your Reason",
            className: "form-control",
            rules: { required: false, }
        },
        {
            name: "notes",
            label: "Notes",
            type: "text",
            placeholder: "Enter your Notes",
            className: "form-control",
            rules: { required: false, }
        },
        {
            name: "doctor",
            label: "Doctor",
            type: "searchSelect",
            options: [{ label: "select Doctor", value: "", disabled: true }, ...doctorOptions],
            className: "form-select",
            rules: { required: true }
        },
        {
            name: "patient",
            label: "Patient",
            type: "searchSelect",
            options: [{ label: "select Patient", value: "", disabled: true }, ...patinetOptions],
            className: "form-select",
            rules: { required: true }
        },
        {
            name: "payment",
            type: "formGroup",
            object: true,
            formGroup: {
                amount: {
                    name: "amount",
                    label: "Amount",
                    placeholder: "Enter amount",
                    type: "number",
                    className: "sm:col-span-3 xl:col-span-2",
                    rules: {
                        required: false,
                    }
                },
                method: {
                    name: "method",
                    label: "Method",
                    type: "select",
                    options: [
                        { name: "Select Method", label: "Select Method", disabled: true },
                        { label: "cash", name: "cash", value: "cash" },
                        { label: "online", name: "online", value: "online" },
                        { label: "card", name: "card", value: "card" }
                    ],
                    className: "sm:col-span-3 xl:col-span-2 mt-8 sm:mt-0",
                    rules: { required: false }
                },
                status: {
                    name: "status",
                    label: "Status",
                    type: "select",
                    options: [
                        { name: "Select status", label: "Select status", disabled: true },
                        { label: "paid", name: "paid", value: "paid" },
                        { label: "unpaid", name: "unpaid", value: "unpaid" }

                    ],
                    className: "sm:col-span-3 xl:col-span-2 mt-8 xl:mt-0",
                    rules: { required: false }
                },
                patientType: {
                    name: "patientType",
                    label: "patientType",
                    type: "select",
                    options: [
                        { name: "Select patientType", label: "Select patientType", disabled: true },
                        { label: "new", name: "new", value: "new" },
                        { label: "regular", name: "regular", value: "regular" }

                    ],
                    className: "sm:col-span-3 xl:col-span-2 mt-8",
                    rules: { required: false }
                },
            },
            rules: {}
        },


        {
            name: "timeSlot",
            type: "formGroup",
            object: true,
            formGroup: {
                from: {
                    name: "from",
                    label: "From",
                    type: "time",
                    className: "sm:col-span-3 xl:col-span-2",
                    rules: { required: true }
                },
                to: {
                    name: "to",
                    label: "to",
                    type: "time",
                    className: "sm:col-span-3 xl:col-span-2 mt-8 sm:mt-0",
                    rules: { required: true }
                },
            },
            rules: {}
        },

    ];


    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>


    const { renderSingleInput, handleSubmit, setValue, reset } = useDynamicForm({ schema, fields, onSubmit, defaultValues })

    useEffect(() => {
        if (id && appointment) {
            const isoDate = appointment.date;
            const dateOnly = isoDate ? new Date(isoDate).toISOString().split("T")[0] : "";
            setValue("patient", appointment.patient.name)
            setValue("doctor", appointment.doctor.doctor.firstName)
            setValue("clinic", appointment.clinic.name)
            setValue("reason", appointment.reason)
            setValue("status", appointment.status)
            setValue("label", appointment.label)
            setValue("payment.status", appointment.payment.status)
            setValue("date", dateOnly)
            setValue("notes", appointment.notes)
            setValue("payment.amount", appointment.payment?.amount?.toString() || " ")
            setValue("payment.method", appointment.payment?.method)
            setValue("payment.patientType", appointment.payment?.patientType)
            setValue("timeSlot.from", appointment.timeSlot?.from)
            setValue("timeSlot.to", appointment.timeSlot?.to)
        }
    }, [appointment])





    useEffect(() => {
        if (addsuccess) {
            toast.showSuccess("Add Appointment Success")
        }

        if (updateSuccess) {
            toast.showSuccess("Update Appointment Success")
        }

        if (addIsError) {
            toast.showError(adderror as string)
        }
        if (updateIserror) {
            toast.showError(Updateerror as string)
        }

    }, [updateSuccess, addsuccess, addIsError, updateIserror, adderror])

    return <>

        <div className="grid grid-cols-1 gap-x-8 gap-y-8">
            <div className="flex justify-between">
                <h2 className="text-lg font-bold text-gray-900">{id ? "Update Appointment" : "Add Appointment"}</h2>
                <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => navigate("/appointment")}
                >
                    Back
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('doctor')}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('patient')}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('date')}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('reason')}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('label')}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('notes')}
                        </div>
                        <div className="sm:col-span-6">
                            {renderSingleInput('payment')}
                        </div>
                        <div className="sm:col-span-6">
                            {renderSingleInput('timeSlot')}
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
        </div>
    </>
}

export default AddAppointment