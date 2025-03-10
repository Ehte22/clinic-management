import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import { z } from "zod"
import { FieldConfig } from "../models/fieldConfig.interface"
import { useEffect, useState } from "react"
import { useRegisterUserMutation, useSendOTPMutation, useVerifyOTPMutation } from "../redux/apis/user.api"
import { toast } from "../utils/toast"
import { customValidator } from "../utils/validator"
import useDynamicForm from "../components/useDynamicForm"
import Loader from "../components/Loader"

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
        name: "password",
        label: "Password",
        placeholder: "Enter Password",
        type: "password",
        rules: { required: true, min: 8, max: 16 }
    },
    {
        name: "phone",
        label: "Phone Number",
        placeholder: "Enter Phone Number",
        type: "text",
        rules: { required: true, pattern: /^[6-9]\d{9}$/ }
    },
    {
        name: "profile",
        label: "Profile",
        type: "file",
        rules: { required: false, file: true }
    },

]

const defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    profile: "",
    clinicId: "",
    password: "",
}

const UserRegistration = () => {

    // hooks
    const navigate = useNavigate()

    // States
    const [OTP, setOTP] = useState("")

    // Queries and Mutations
    const [createUser, { data: registerData, isLoading: createUserLoading, error: registerErrorMessage, isSuccess: registerSuccess, isError: registerError }] = useRegisterUserMutation()
    const [sendOtp, { data: otpSendMessage, isLoading: isSendOtpLoading, error: otpSendErrorMessage, isSuccess: otpSendSuccess, isError: otpSendError }] = useSendOTPMutation()
    const [verifyOtp, { data: otpVerifyMessage, isLoading: isVerifyOtpLoading, error: otpVerifyErrorMessage, isSuccess: otpVerifySuccess, isError: otpVerifyError }] = useVerifyOTPMutation()

    // Function for send OTP
    const sendOTP = () => {
        const email = getValues("email")
        if (email) {
            sendOtp({ username: email })
        }
    }

    // Function for Verify OTP
    const verifyOTP = () => {
        const email = getValues("email")
        if (email && OTP) {
            verifyOtp({ username: email, otp: OTP })
        }
    }

    // Custom Validator
    const schema = customValidator(fields)

    type FormValues = z.infer<typeof schema>

    // Submit Function
    const onSubmit = (data: FormValues) => {
        let updatedData = data
        const clinicId = localStorage.getItem("clinicId")

        if (clinicId) {
            updatedData = { ...data, clinicId }
        }

        const formData = new FormData()

        Object.keys(updatedData).forEach(key => {
            if (key === "profile" && typeof updatedData[key] == "object") {
                Object.keys(updatedData.profile).forEach(item => {
                    formData.append(key, updatedData.profile[item])
                })
            } else {
                formData.append(key, updatedData[key])
            }
        })

        if (otpVerifySuccess) {
            createUser(formData)
        } else {
            toast.showError("Please verify your email address")
        }
    }

    // Dynamic Form Component
    const { renderSingleInput, handleSubmit, getValues, disableField, reset } =
        useDynamicForm({ schema, fields, onSubmit, defaultValues })


    useEffect(() => {
        if (otpSendSuccess) {
            toast.showSuccess(otpSendMessage)
        }

        if (otpVerifySuccess) {
            toast.showSuccess(otpVerifyMessage)
            disableField('email', true)
        }

        if (registerSuccess) {
            toast.showSuccess(registerData.message)
            localStorage.removeItem("clinicId")
            reset()
            navigate(`${import.meta.env.VITE_BACKEND_URL}/login`)
        }

    }, [otpSendMessage, otpSendSuccess, otpVerifyMessage, otpVerifySuccess, registerData, registerSuccess])

    useEffect(() => {
        if (otpSendError) {
            toast.showError(otpSendErrorMessage as string)
        }

        if (otpVerifyError) {
            toast.showError(otpVerifyErrorMessage as string)
        }

        if (registerError) {
            toast.showError(registerErrorMessage as string)
        }
    }, [otpSendErrorMessage, otpSendError, otpVerifyErrorMessage, otpVerifyError, registerErrorMessage, registerError])

    return <>
        <div className=" px-4 md:px-12 lg:px-20 pb-12 pt-28">
            <div className="grid grid-cols-1 gap-x-8 gap-y-8">
                <p>
                    <span className="font-bold">Note:</span>
                    <span> Please fill out this form; otherwise, you will not get login access.</span>
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                    <div className="px-4 py-6 sm:p-8">
                        <h2 className="text-xl font-bold mb-5">User Details</h2>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                            {/* First Name */}
                            <div className="sm:col-span-3 xl:col-span-2">
                                {renderSingleInput("firstName")}
                            </div>

                            {/* Last Name */}
                            <div className="sm:col-span-3 xl:col-span-2">
                                {renderSingleInput("lastName")}
                            </div>

                            {/* Phone Number */}
                            <div className="sm:col-span-3 xl:col-span-2">
                                {renderSingleInput("phone")}
                            </div>

                            {/* Email */}
                            <div className="sm:col-span-6 xl:col-span-4">
                                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-6 md:col-span-3">
                                        {renderSingleInput("email")}
                                    </div>

                                    {
                                        otpVerifySuccess && !registerSuccess && <CheckCircleIcon
                                            aria-hidden="true"
                                            className="mt-8 size-8 text-teal-400" />
                                    }

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
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base  text-gray-900  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                                            onChange={(e) => setOTP((e.target as HTMLInputElement).value)}
                                                        />
                                                    </div>
                                                </div>
                                            }

                                            {!otpVerifySuccess &&
                                                <div className={`sm:col-span-2 md:col-span-3 ${otpSendSuccess ? "sm:mt-8" : "md:mt-8"}`}>
                                                    {
                                                        isSendOtpLoading || isVerifyOtpLoading
                                                            ? <Loader />
                                                            : <button
                                                                type="button"
                                                                onClick={otpSendSuccess ? verifyOTP : sendOTP}
                                                                className="rounded-md bg-teal-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                                                            >
                                                                Verify {otpSendSuccess ? "OTP" : "Email"}
                                                            </button>
                                                    }
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Password */}
                            <div className="sm:col-span-3 xl:col-span-2">
                                {renderSingleInput("password")}
                            </div>

                            {/* Profile */}
                            <div className="sm:col-span-6">
                                {renderSingleInput("profile")}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                        {
                            createUserLoading
                                ? <Loader />
                                : <>
                                    <button onClick={() => reset()} type="button" className="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
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
                </form >
            </div >
        </div>
    </>

}


export default UserRegistration