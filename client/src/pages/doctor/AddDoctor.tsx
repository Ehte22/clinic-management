import { useEffect, useState } from 'react'
import { customValidator } from '../../utils/validator'
import useDynamicForm from '../../components/useDynamicForm'
import { FieldConfig } from '../../models/fieldConfig.interface';
import { ValidationRules } from '../../models/validationRules.interface';
import { useGetDoctorByIdQuery, useUpdateDoctorMutation } from '../../redux/apis/doctor.api';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { IDocData } from './Doctor';
import { idbHelpers } from '../../indexDB';




const defaultValues = {
    specialization: "",
    label: "",
    experience_years: "",
    qualifications: "",
    emergency_contact: "",
    bio: "",
    schedule: [{
        day: "",
        from: "",
        to: "",
    }],
}

export interface ExtractedRule {
    name: string;
    rules: ValidationRules | ExtractedRule[];
}
const AddDoctor = () => {
    const [doctor, setDoctor] = useState<IDocData | null>(null)
    const { id } = useParams()

    const { data: singleDoctor } = useGetDoctorByIdQuery(id as string || "", {
        skip: !id || !navigator.onLine,
    })


    const [updatedoctor, { isSuccess: updateSuccess, isError: updateIserror, error: Updateerror }] = useUpdateDoctorMutation()
    const navigate = useNavigate()

    const onSubmit = (values: FormValues) => {
        let updatedValues: Record<string, any> = {};


        Object.keys(values)?.forEach((key) => {
            if (key === "schedule") {
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

        updatedValues = { ...updatedValues, ...values }

        if (doctor && doctor._id) {
            if (navigator.onLine) {
                updatedoctor({ doctorData: updatedValues, id: doctor._id })
            } else {
                idbHelpers.update({ storeName: "doctors", endpoint: "doctor/update-doctors", _id: doctor._id, data: updatedValues })
            }
        }
    };

    useEffect(() => {
        if (id) {
            if (singleDoctor && navigator.onLine) {
                setDoctor(singleDoctor);
            } {
                const fetchSupplier = async () => {
                    const offlineSupplier = await idbHelpers.get({ storeName: "doctors", _id: id });

                    setDoctor(offlineSupplier);
                };
                fetchSupplier();
            }
        }
    }, [id, singleDoctor]);

    useEffect(() => {
        if (updateSuccess) {
            navigate("/doctor")
        }
    }, [updateSuccess]);

    useEffect(() => {
        if (id && doctor) {

            setValue("specialization", doctor?.specialization)
            setValue("emergency_contact", doctor?.emergency_contact)
            setValue("label", doctor?.label)
            setValue("bio", doctor?.bio)
            setValue("experience_years", doctor?.experience_years)
            setValue("qualifications", doctor?.qualifications)
            if (doctor?.schedule) {
                const updatedSchedule = doctor.schedule.map((item: any) => ({
                    day: item.day,
                    from: item.from,
                    to: item.to,
                }));
                setValue("schedule", updatedSchedule);
            }
        }
    }, [doctor])


    useEffect(() => {

        if (updateSuccess) {
            toast.showSuccess("Update Doctor Success")
        }

        if (updateIserror) {
            toast.showError(Updateerror as string)
        }

    }, [updateSuccess, updateIserror, Updateerror])





    const fields: FieldConfig[] = [
        {
            name: "specialization",
            label: "Specialization",
            type: "text",
            placeholder: "Enter your Specialization",
            rules: { required: false, min: 2, max: 16 }
        },
        {
            name: "label",
            label: "Label",
            type: "text",
            placeholder: "Enter your Label",
            rules: { required: false, min: 2, max: 16 }
        },
        {
            name: "experience_years",
            label: "Experience Years",
            type: "text",
            placeholder: "Enter your experience years",
            rules: { required: false, }
        },
        {
            name: "emergency_contact",
            label: "Emergency Contact",
            type: "text",
            placeholder: "Enter your Emergency Contact",
            rules: { required: false, pattern: /^[6-9]\d{9}$/ }
        },
        {
            name: "qualifications",
            label: "Qualifications",
            placeholder: "Enter Qualifications",
            type: "text",
            rules: { required: false, }
        },
        // {
        //     name: "doctor",
        //     label: "Doctor",
        //     type: "searchSelect",
        //     options: [{ label: "Select Doctor", value: "", disabled: true }, ...doctorOptions],
        //     rules: { required: true }
        // },
        // {
        //     name: "clinic",
        //     label: "Clinic",
        //     type: "searchSelect",
        //     options: [{ label: "select Clinic", value: "", disabled: true }, ...clinicOptions],
        //     rules: { required: true }
        // },
        {
            name: "bio",
            label: "Bio",
            type: "textarea",
            placeholder: "Enter text here",
            rows: 4,
            rules: { required: false, min: 5, max: 100 }
        },
        {
            name: "button",
            displayName: "Add User",
            type: "submit",
            className: "btn btn-dark text-end my-3 me-4",
            rules: {}
        },
        {
            name: "schedule",
            displayName: "schedule",
            type: "formArray",
            className: "border px-4 py-6 sm:p-8 my-4",
            formArray: [
                {
                    name: "day",
                    label: "Day",
                    options: [
                        { label: "Select Day", name: "Select Day", disabled: true },
                        { label: "monday", name: "monday", value: "monday" },
                        { label: "tuesday", name: "tuesday", value: "tuesday" },
                        { label: "wednesday", name: "wednesday", value: "wednesday" },
                        { label: "thursday", name: "thursday", value: "thursday" },
                        { label: "friday", name: "friday", value: "friday" },
                        { label: "saturday", name: "saturday", value: "saturday" },
                        { label: "sunday", name: "sunday", value: "sunday" },
                    ],
                    placeholder: "Enter Day",
                    type: "select",
                    className: "sm:col-span-6 xl:col-span-4",
                    rules: { required: false }
                },
                {
                    name: "from",
                    label: "From",
                    type: "time",
                    className: "sm:col-span-6 xl:col-span-4",
                    rules: { required: false }
                },
                {
                    name: "to",
                    label: "to",
                    type: "time",
                    className: "sm:col-span-6 xl:col-span-4",
                    rules: { required: false }
                }
            ],
            rules: {}
        },

    ];



    const schema = customValidator(fields)


    type FormValues = z.infer<typeof schema>
    const { renderSingleInput, handleSubmit, setValue, reset } = useDynamicForm({ schema, fields, onSubmit, defaultValues })
    return <>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8">
            <div className="flex justify-between">
                <h2 className="text-lg font-bold text-gray-900">{id ? "Update Doctor" : "Add Doctor"}</h2>
                <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => navigate("/doctor")}
                >
                    Back
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('specialization')}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('experience_years')}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('qualifications')}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('label')}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput('emergency_contact')}
                        </div>
                        <div className="sm:col-span-6">
                            {renderSingleInput('bio')}
                        </div>

                        <div className="sm:col-span-6">
                            {renderSingleInput('schedule')}
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

export default AddDoctor