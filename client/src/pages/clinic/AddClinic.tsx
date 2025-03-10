import { useContext, useEffect, useState } from "react"
import useDynamicForm from "../../components/useDynamicForm"
import { FieldConfig } from "../../models/fieldConfig.interface"
import { useCreateClinicMutation, useGetClinicByIdQuery, useUpdateClinicMutation } from "../../redux/apis/clinic.api"
import { customValidator } from "../../utils/validator"
import { toast } from "../../utils/toast"
import { useNavigate, useParams } from "react-router-dom"
import { ImagePreviewContext } from "../../App"
import { z } from "zod"
import Loader from "../../components/Loader"
import { idbHelpers } from "../../indexDB"
import { IClinic } from "../../models/clinic.interface"

const fields: FieldConfig[] = [
    {
        name: "name",
        label: "Clinic Name",
        placeholder: "Enter Clinic Name",
        type: "text",
        rules: { required: true, min: 2, max: 50 }
    },
    {
        name: "contactInfo",
        label: "Phone Number",
        placeholder: "Enter Phone Number",
        type: "text",
        rules: { required: true, pattern: /^[6-9]\d{9}$/ }
    },
    {
        name: "email",
        label: "Email Address",
        placeholder: "Enter Email Address",
        type: "text",
        rules: { required: false, email: true }
    },
    {
        name: "startDate",
        label: "Start Date",
        type: "date",
        rules: { required: true }
    },
    {
        name: "endDate",
        label: "End Date",
        type: "date",
        rules: { required: true }
    },
    {
        name: "amount",
        label: "Amount",
        placeholder: "Enter Amount",
        type: "text",
        rules: { required: true, number: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
    },
    {
        name: "alternateContactInfo",
        label: "Alternate Phone Number",
        placeholder: "Enter Alternate Phone Number",
        type: "text",
        rules: { required: false, pattern: /^[6-9]\d{9}$/ }
    },
    {
        name: "street",
        label: "Street Address",
        placeholder: "Enter Street Address",
        type: "text",
        rules: { required: true, min: 2, max: 500 }
    },
    {
        name: "city",
        label: "City",
        placeholder: "Enter City",
        type: "text",
        rules: { required: true, min: 2, max: 100 }
    },
    {
        name: "state",
        label: "State",
        placeholder: "Enter State",
        type: "text",
        rules: { required: true, min: 2, max: 100 }
    },
    {
        name: "country",
        label: "Country",
        type: "select",
        options: [
            { label: "Select Country", value: "", disabled: true },
            { label: "India", value: "India" },
            { label: "United States", value: "United States" },
            { label: "United Kingdom", value: "United Kingdom" },
            { label: "Australia", value: "Australia" }
        ],
        rules: { required: true, min: 2, max: 100 }
    },
    {
        name: "logo",
        label: "Logo",
        type: "file",
        rules: { required: false, file: true, maxSize: 10 }
    },
]

const defaultValues = {
    name: "",
    contactInfo: "",
    email: "",
    startDate: "",
    endDate: "",
    amount: "",
    alternateContactInfo: "",
    city: "",
    state: "",
    street: "",
    country: "India",
    logo: ""
}

const AddClinic = () => {

    // Hooks
    const navigate = useNavigate()
    const { id } = useParams()
    const { setPreviewImages } = useContext(ImagePreviewContext)
    const [clinic, setClinic] = useState<IClinic | null>(null)

    // Queries and Mutations
    const [createClinic, { data: createData, isLoading: createClinicLoading, error: errorData, isSuccess: createSuccess, isError: createError }] = useCreateClinicMutation()
    const { data: clinicData, isLoading, isFetching, error: getClinicErrorMessage, isError: getClinicError } = useGetClinicByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })
    const [updateClinic, { data: updateMessage, isLoading: updateClinicLoading, error: updateErrorMessage, isSuccess: updateSuccess, isError: updateError }] = useUpdateClinicMutation()

    // Custom Validator
    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    // Submit Function
    const onSubmit = (data: FormValues) => {

        const formData = new FormData()

        Object.keys(data).forEach(key => {
            if (key === "logo" && typeof data[key] == "object") {
                Object.keys(data.logo).forEach(item => {
                    formData.append(key, data.logo[item])
                })
            } else {
                formData.append(key, data[key])
            }
        })

        if (clinic && clinic._id) {
            if (navigator.onLine) {
                updateClinic({ clinicData: formData, id: clinic._id })
            } else {
                idbHelpers.update({ storeName: "clinics", endpoint: "clinic/update-clinic", _id: clinic._id, data, isFormData: true })
            }
        } else {
            if (navigator.onLine) {
                createClinic(formData)
            } else {
                idbHelpers.add({ storeName: "clinics", endpoint: "clinic/create-clinic", data: { ...data, status: "active" }, isFormData: true })
            }
        }
    }

    // Dynamic Form
    const { renderSingleInput, handleSubmit, setValue, reset }
        = useDynamicForm({ schema, fields, onSubmit, defaultValues })

    useEffect(() => {
        if (id) {
            if (clinicData) {
                setClinic(clinicData);
            } else if (!navigator.onLine && !isFetching && !isLoading) {
                const fetchData = async () => {
                    const offlineData = await idbHelpers.get({ storeName: "clinics", _id: id });
                    setClinic(offlineData);
                };
                fetchData();
            }
        }
    }, [id, clinicData]);

    useEffect(() => {
        if (id && clinic) {
            console.log(clinic);

            setValue("name", clinic.name)
            setValue("contactInfo", clinic.contactInfo.toString() || "")
            setValue("email", clinic?.email)
            setValue("alternateContactInfo", clinic.alternateContactInfo?.toString() || "")
            setValue("city", clinic.city)
            setValue("state", clinic.state)
            setValue("street", clinic.street)
            setValue("country", clinic.country)
            setValue("amount", clinic.amount.toString() || "")

            if (clinic.startDate) {
                const startDate = new Date(clinic.startDate).toISOString().split("T")[0]
                setValue("startDate", startDate || "")
            }

            if (clinic.endDate) {
                const endDate = new Date(clinic.endDate).toISOString().split("T")[0]
                setValue("endDate", endDate || "")
            }

            if (clinic.logo) {
                setValue("logo", clinic.logo)
                setPreviewImages([clinic.logo])
            }
        }
    }, [id, clinic])

    useEffect(() => {
        if (createSuccess) {
            toast.showSuccess(createData.message)
            setPreviewImages([])
            reset()
            navigate("/clinics")
        }
        if (updateSuccess) {
            toast.showSuccess(updateMessage)
        }

        if (createError) {
            toast.showError(errorData as string)
        }

        if (getClinicError) {
            toast.showError(getClinicErrorMessage as string)
        }

        if (updateError) {
            toast.showError(updateErrorMessage as string)
        }
    }, [createData, createSuccess, errorData, createError, getClinicError, getClinicErrorMessage, updateError, updateSuccess, updateMessage, updateErrorMessage])

    return <>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8">
            <div className="flex justify-between">
                <h2 className="text-lg font-bold text-gray-900">{id ? "Update Clinic" : "Add Clinic"}</h2>
                <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => navigate("/clinics")}
                >
                    Back
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        {/* Clinic Name */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("name")}
                        </div>

                        {/* Contact Info */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("contactInfo")}
                        </div>

                        {/* Email */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("email")}
                        </div>

                        {/* Start Date */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("startDate")}
                        </div>

                        {/* End Date */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("endDate")}
                        </div>

                        {/* Amount */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("amount")}
                        </div>

                        {/* Alternate Phone Number */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("alternateContactInfo")}
                        </div>

                        {/* Street Address */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("street")}
                        </div>

                        {/* City */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("city")}
                        </div>

                        {/* State */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("state")}
                        </div>

                        {/* Country */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("country")}
                        </div>

                        {/* Logo */}
                        <div className="sm:col-span-6">
                            {renderSingleInput("logo")}
                        </div>

                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                    {
                        createClinicLoading || updateClinicLoading
                            ? <Loader />
                            : <>
                                <button onClick={() => reset()} type="button" className="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Save
                                </button>
                            </>
                    }
                </div>
            </form>
        </div>
    </>
}

export default AddClinic

