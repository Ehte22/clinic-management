import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { z } from "zod"
import { FieldConfig } from "../models/fieldConfig.interface"
import { customValidator } from "../utils/validator"
import useDynamicForm from "../components/useDynamicForm"
import { toast } from "../utils/toast"
import { useRegisterClinicMutation } from "../redux/apis/clinic.api"
import { useInitiatePaymentMutation, useVerifyPaymentMutation } from "../redux/apis/payment.api"
import Loader from "../components/Loader"

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
    // {
    //     name: "startDate",
    //     label: "Start Date",
    //     type: "date",
    //     rules: { required: true }
    // },
    // {
    //     name: "endDate",
    //     label: "End Date",
    //     type: "date",
    //     rules: { required: true }
    // },
    {
        name: "plan",
        label: "Subscription Plan",
        type: "radio",
        options: [
            { label: "Monthly - 1000", value: "monthly" },
            { label: "Yearly - 10000", value: "yearly" },
        ],
        rules: { required: true }
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
    // startDate: "",
    // endDate: "",
    amount: "",
    alternateContactInfo: "",
    city: "",
    state: "",
    street: "",
    country: "India",
    logo: "",
    plan: ""
}

const ClinicRegistration = () => {

    // Hooks
    const navigate = useNavigate()

    // Queries and Mutations
    const [registerClinic, { data: createData, isLoading: createClinicLoading, error: errorData, isSuccess: createSuccess, isError: createError }] = useRegisterClinicMutation()
    const [initiatePayment] = useInitiatePaymentMutation()
    const [verifyPayment] = useVerifyPaymentMutation()

    // Custom Validator
    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    // Submit Function
    const onSubmit = async (data: FormValues) => {
        try {
            const amount = data.plan === "monthly" ? 1000 : 10000;

            const response = await initiatePayment(amount).unwrap()

            const options: any = {
                key: `${import.meta.env.VITE_RAZORPAY_API_KEY}`,
                amount: response.amount,
                currency: "INR",
                name: "Clinic Subscription",
                description: "Payment for clinic registration",
                order_id: response.orderId,
                handler: async function (paymentResponse: any) {
                    const verifyRes = await verifyPayment(paymentResponse).unwrap();

                    if (verifyRes.success) {
                        toast.showSuccess("Payment successful! Registering clinic...");

                        const formData = new FormData();
                        Object.keys(data).forEach(key => {
                            if (key === "logo" && typeof data[key] === "object") {
                                Object.keys(data.logo).forEach(item => {
                                    formData.append(key, data.logo[item]);
                                });
                            } else {
                                formData.append(key, data[key]);
                            }
                        });

                        await registerClinic(formData);
                    } else {
                        toast.showError("Payment verification failed!");
                    }
                },
                prefill: {
                    name: data.name,
                    email: data.email,
                    contact: data.contactInfo
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const razor = new (window as any).Razorpay(options);
            razor.open();

        } catch (error) {
            toast.showError("Payment initiation failed!");
        }
    };

    // Dynamic Form
    const { renderSingleInput, handleSubmit, reset }
        = useDynamicForm({ schema, fields, onSubmit, defaultValues })

    useEffect(() => {
        if (createSuccess) {
            reset()
            navigate(`/register-user/${createData.result._id}`)
        }

        if (createError) {
            toast.showError(errorData as string)
        }

    }, [createData, createSuccess, errorData, createError])

    return <>
        <div className=" px-4 md:px-12 lg:px-20 pb-12 pt-28">
            <div className="grid grid-cols-1 gap-x-8 gap-y-8">

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    <div className="px-4 py-6 sm:p-8">
                        <h2 className="text-xl font-bold mb-5">Clinic Details</h2>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">

                            {/* Clinic Name */}
                            <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("name")}
                            </div>

                            {/* Contact Info */}
                            <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("contactInfo")}
                            </div>

                            {/* Email */}
                            <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("email")}
                            </div>

                            {/* Start Date */}
                            {/* <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("startDate")}
                            </div> */}

                            {/* End Date */}
                            {/* <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("endDate")}
                            </div> */}

                            {/* Alternate Phone Number */}
                            <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("alternateContactInfo")}
                            </div>

                            {/* Subscription Plan */}
                            <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("plan")}
                            </div>

                            {/* Street Address */}
                            <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("street")}
                            </div>

                            {/* City */}
                            <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("city")}
                            </div>

                            {/* State */}
                            <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("state")}
                            </div>

                            {/* Country */}
                            <div className="sm:col-span-6 lg:col-span-4 xl:col-span-3">
                                {renderSingleInput("country")}
                            </div>

                            {/* Logo */}
                            <div className="sm:col-span-12">
                                {renderSingleInput("logo")}
                            </div>

                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                        {
                            createClinicLoading
                                ? <Loader />
                                : <>
                                    <button onClick={() => reset()} type="button" className="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-600  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
                                    >
                                        Save
                                    </button>
                                </>
                        }
                    </div>
                </form>
            </div>
        </div>
    </>

}

export default ClinicRegistration

