import React, { useContext, useEffect, useState } from "react";
import { z } from "zod";
import { FieldConfig } from "../../models/fieldConfig.interface";
import { customValidator } from "../../utils/validator";
import { useAddReceptionistMutation, useGetReceptionistByIdQuery, useUpdateReceptionistMutation } from "../../redux/apis/receptionistApi";
import useDynamicForm from "../../components/useDynamicForm";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "../../utils/toast";
import { useSendOTPMutation, useVerifyOTPMutation } from "../../redux/apis/auth.api";
import { ImagePreviewContext } from "../../App";
import { CheckCircleIcon } from "@heroicons/react/16/solid";
import { idbHelpers } from "../../indexDB";
import Loader from "../../components/Loader";

export interface Receptionist {
    _id: string;
    user: string;
    clinic: string;
    doctor: string;
    status: "active" | "inactive";
    working_hours: { day: string; from: string; to: string }[];
}


const AddReceptionist: React.FC = () => {
    const [receptionist, setReceptionist] = useState<any | null>(null)
    const [addReceptionist, { isSuccess }] = useAddReceptionistMutation()
    const [OTP, setOTP] = useState("")
    const { id } = useParams()
    const [UpdateReceptionist, { isSuccess: isSuccessUpdate }] = useUpdateReceptionistMutation();
    const { data: Receptionists, isLoading: isLoadingReceptionists } = useGetReceptionistByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })
    type FormValues = z.infer<typeof schema>
    const navigate = useNavigate()
    const { setPreviewImages } = useContext(ImagePreviewContext)
    const [sendOtp, { data: otpSendMessage, error: otpSendErrorMessage, isSuccess: otpSendSuccess, isError: otpSendError }] = useSendOTPMutation()
    const [verifyOtp, { data: otpVerifyMessage, error: otpVerifyErrorMessage, isSuccess: otpVerifySuccess, isError: otpVerifyError }] = useVerifyOTPMutation()

    const sendOTP = () => {
        const email = getValues("email")
        if (email && navigator.onLine) {
            sendOtp({ username: email })
        } else if (!navigator.onLine) {
            toast.showInfo("You are offline")
        }
    }
    const verifyOTP = () => {
        const email = getValues("email")
        if (email && OTP && navigator.onLine) {
            verifyOtp({ username: email, otp: OTP })
        } else if (!navigator.onLine) {
            toast.showInfo("You are offline")
        }
    }
    const fields: FieldConfig[] = [
        {
            name: "firstName",
            label: "First Name",
            placeholder: "Enter First Name",
            type: "text",
            rules: { required: true, min: 2, max: 16 }
        },
        {
            name: "lastName",
            label: "Last Name",
            placeholder: "Enter Last Name",
            type: "text",
            rules: { required: true, min: 2, max: 16 }
        },
        {
            name: "email",
            label: "Email Address",
            placeholder: "Enter Email Address",
            type: "text",
            rules: { required: true, email: true }
        },
        {
            name: "mobile",
            label: "Phone Number",
            placeholder: "Enter Phone Number",
            type: "number",
            rules: { required: true, pattern: /^[6-9]\d{9}$/ }
        },
        {
            name: "profile",
            label: "Profile",
            type: "file",
            rules: { required: false, file: true }
        },
        {
            name: "working_hours",
            displayName: "Working Hours",
            type: "formArray",
            formArray: [
                {
                    name: "day",
                    label: "Day",
                    placeholder: "Enter Available Day",
                    type: "date",
                    className: "sm:col-span-6 xl:col-span-4",
                    rules: { required: true },
                },
                {
                    name: "from",
                    label: "From",
                    type: "time",
                    className: "sm:col-span-6 xl:col-span-4",
                    rules: { required: true },
                },
                {
                    name: "to",
                    label: "To",
                    type: "time",
                    className: "sm:col-span-6 xl:col-span-4",
                    rules: { required: true },
                },
            ],
            rules: {},
        },
        {
            name: "submit",
            displayName: "Add Receptionist",
            type: "submit",
            className: "w-full py-3 px-6 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-200 mt-6 shadow-lg",
            rules: {},
        },
    ]
    const schema = customValidator(fields)
    const defaultValues = {
        firstName: Receptionists?.user.firstName || "",
        lastName: Receptionists?.user.lastName || "",
        email: Receptionists?.user.email || "",
        mobile: Receptionists?.user.phone || "",
        status: Receptionists?.status || "",
        working_hours: [
            { day: "", from: "", to: "" },
        ],
        profile: ""
    }
    const onSubmit = (data: FormValues) => {
        let updatedData = data
        const formData = new FormData()

        Object.keys(updatedData).forEach(key => {
            if (key === "profile" && typeof updatedData[key] == "object") {
                Object.keys(updatedData.profile).forEach(item => {
                    formData.append(key, updatedData.profile[item])
                    setPreviewImages(updatedData.profile[item])
                })
            } else if (key === "working_hours") {
                values[key].forEach((item: Record<string, string>, index: number) => {
                    Object.keys(item).forEach((subKey: string) => {
                        formData.append(`${key}[${index}][${subKey}]`, item[subKey])
                    })
                })
            } else {
                formData.append(key, updatedData[key])
            }
        })
        if (receptionist && receptionist._id) {
            const email = getValues("email")

            if (email === receptionist.user.email) {
                if (navigator.onLine) {
                    UpdateReceptionist({ _id: receptionist._id, data: formData })
                } else {
                    idbHelpers.update({ storeName: "receptionists", endpoint: "receptionist/update-receptionists", _id: receptionist._id, data, isFormData: true })

                }
            } else {
                toast.showError("Please verify your email address")
            }
        } else {
            // if (otpVerifySuccess) {
            if (navigator.onLine) {
                addReceptionist(formData)
            } else {
                idbHelpers.add({ storeName: "receptionists", endpoint: "receptionist/add-receptionist", data, isFormData: true })
            }
            // } else {
            //     toast.showError("Please verify your email address")
            // }
        }
    }
    const { renderSingleInput, handleSubmit, getValues, disableField, setValue, watch, reset } =
        useDynamicForm({ schema, fields, onSubmit, defaultValues })
    const values = watch()

    useEffect(() => {
        if (id) {
            if (Receptionists && navigator.onLine) {
                setReceptionist(Receptionists);
            } else {
                const fetchSupplier = async () => {
                    const offlineSupplier = await idbHelpers.get({ storeName: "receptionists", _id: id });

                    setReceptionist(offlineSupplier);
                };
                fetchSupplier();
            }
        }
    }, [id, Receptionists]);

    useEffect(() => {
        if (otpSendSuccess) {
            toast.showSuccess(otpSendMessage)
        }

        if (otpVerifySuccess) {
            toast.showSuccess(otpVerifyMessage)
            disableField('email', true)
        }
    }, [otpSendMessage, otpSendSuccess, otpVerifyMessage, otpVerifySuccess])
    useEffect(() => {
        if (id && receptionist) {
            setValue("user", receptionist?._id)
            setValue("firstName", receptionist?.user.firstName)
            setValue("lastName", receptionist?.user.lastName)
            setValue("email", receptionist?.user.email)
            setValue("mobile", receptionist?.user.phone.toString() || "")
            setValue("status", receptionist?.status)
            if (receptionist?.user.profile) {
                setValue("profile", receptionist?.user?.profile)
                setPreviewImages([receptionist?.user?.profile as string])
            }
            setValue("working_hours", receptionist?.working_hours)
        }
    }, [id, receptionist])
    useEffect(() => {
        if (otpSendError) {
            toast.showError(otpSendErrorMessage as string)
        }

        if (otpVerifyError) {
            toast.showError(otpVerifyErrorMessage as string)
        }
    }, [otpSendErrorMessage, otpSendError, otpVerifyErrorMessage, otpVerifyError])
    useEffect(() => {
        if (isSuccess) {
            toast.showSuccess("Receptionist added successfully!")
        } else if (isSuccessUpdate) {
            toast.showSuccess("Receptionist Update successfully!")
        }
    }, [isSuccess, isSuccessUpdate])
    if (isLoadingReceptionists) {
        return <div className="flex justify-center items-center h-screen -mt-20">
            <Loader size={16} />
        </div>
    }
    return (
        <div className="grid grid-cols-1 gap-x-8 gap-y-8">
            <div className="flex justify-between">
                <h2 className="text-lg font-bold text-gray-900">Add Receptionist</h2>
                <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => navigate("/receptionist")}>Back</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("firstName")}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("lastName")}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("mobile")}
                        </div>
                        <div className="sm:col-span-6 xl:col-span-4">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-6 md:col-span-3">
                                    {renderSingleInput("email")}
                                </div>
                                {otpVerifySuccess && <CheckCircleIcon aria-hidden="true" className="mt-8 size-8 text-teal-400" />}
                                <div className="sm:col-span-6 md:col-span-3">
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                        {otpSendSuccess && !otpVerifySuccess &&
                                            <div className="sm:col-span-4 md:col-span-3">
                                                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                                                    OTP
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Enter OTP"
                                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base  text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                                        onChange={(e) => setOTP((e.target as HTMLInputElement).value)} />
                                                </div>
                                            </div>
                                        }
                                        {!otpVerifySuccess &&
                                            <div className={`sm:col-span-2 md:col-span-3 ${otpSendSuccess ? "sm:mt-8" : "md:mt-8"}`}>
                                                <button
                                                    type="button"
                                                    onClick={otpSendSuccess ? verifyOTP : sendOTP}
                                                    className="rounded-md bg-teal-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
                                                    Verify {otpSendSuccess ? "OTP" : "Email"}
                                                </button>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            {renderSingleInput('working_hours')}
                        </div>
                        <div className="sm:col-span-6">
                            {renderSingleInput("profile")}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                    <button onClick={() => reset()} type="button" className="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">  Save
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddReceptionist