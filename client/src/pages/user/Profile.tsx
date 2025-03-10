import { useParams } from "react-router-dom"
import { useGetUserByIdQuery, useUpdateUserMutation } from "../../redux/apis/user.api"
import { useEffect, useState } from "react"
import useDynamicForm from "../../components/useDynamicForm"
import { FieldConfig } from "../../models/fieldConfig.interface"
import { CheckCircleIcon, PencilSquareIcon } from "@heroicons/react/16/solid"
import { useSendOTPMutation, useVerifyOTPMutation } from "../../redux/apis/auth.api"
import { customValidator } from "../../utils/validator"
import { toast } from "../../utils/toast"
import { z } from "zod"

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
    profile: "",
}

const Profile = () => {
    // Hooks
    const { id } = useParams()

    // States
    const [OTP, setOTP] = useState("")
    const [isEditAble, setIsEditAble] = useState(false)
    const [previewImage, setPreviewImage] = useState("")

    // Queries and Mutations
    const [updateUser, { data: updateUserMessage, error: updateUserErrorMessage, isSuccess: updateUserSuccess, isError: updateUserError }] = useUpdateUserMutation()
    const [sendOtp, { data: otpSendMessage, error: otpSendErrorMessage, isSuccess: otpSendSuccess, isError: otpSendError }] = useSendOTPMutation()
    const [verifyOtp, { data: otpVerifyMessage, error: otpVerifyErrorMessage, isSuccess: otpVerifySuccess, isError: otpVerifyError }] = useVerifyOTPMutation()
    const { data: userData } = useGetUserByIdQuery(id || "", {
        skip: !id
    })

    // Control the File Input
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target

        if (files && files.length > 0) {
            setValue("profile", files[0])
            setPreviewImage(URL.createObjectURL(files[0]))
        }
    }

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
    const onSubmit = (values: FormValues) => {
        if (isEditAble) {
            const formData = new FormData()

            Object.keys(values).forEach(key => {
                formData.append(key, values[key])
            })

            if (id && userData) {
                const email = getValues("email")

                if (email === userData.email) {
                    updateUser({ userData: formData, id })
                } else {
                    toast.showError("Please verify your email address")
                }
            }

        }

    }

    // Dynamic Form
    const { renderSingleInput, handleSubmit, getValues, disableField, setValue, reset }
        = useDynamicForm({ schema, fields, onSubmit, defaultValues })

    useEffect(() => {
        if (id && userData) {
            setValue("firstName", userData.firstName || "")
            setValue("lastName", userData.lastName || "")
            setValue("email", userData.email || "")
            setValue("phone", userData.phone?.toString() || "")
            setValue("role", userData.role || "")

            if (userData.profile) {
                setValue("profile", userData.profile)
                setPreviewImage(userData.profile)
            }
        }
    }, [id, userData])

    useEffect(() => {
        if (isEditAble) {
            disableField("firstName", false)
            disableField("lastName", false)
            disableField("phone", false)
            disableField("email", false)
        } else {
            disableField("firstName", true)
            disableField("lastName", true)
            disableField("phone", true)
            disableField("email", true)
        }
    }, [isEditAble]);

    useEffect(() => {
        if (otpSendSuccess) {
            toast.showSuccess(otpSendMessage)
        }

        if (otpVerifySuccess) {
            toast.showSuccess(otpVerifyMessage)
            disableField('email', true)
        }

        if (updateUserSuccess) {
            toast.showSuccess(updateUserMessage)
        }

    }, [otpSendMessage, otpSendSuccess, otpVerifyMessage, otpVerifySuccess, updateUserMessage, updateUserSuccess])

    useEffect(() => {
        if (otpSendError) {
            toast.showError(otpSendErrorMessage as string)
        }

        if (otpVerifyError) {
            toast.showError(otpVerifyErrorMessage as string)
        }

        if (updateUserError) {
            toast.showError(updateUserErrorMessage as string)
        }
    }, [otpSendErrorMessage, otpSendError, otpVerifyErrorMessage, otpVerifyError, updateUserError, updateUserErrorMessage])

    return <>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                    <div className="flex justify-end" onClick={() => setIsEditAble(true)}>
                        <PencilSquareIcon className="text-indigo-600 hover:text-indigo-500 cursor-pointer size-6" />
                    </div>
                    <div className="flex justify-center mt-5 mb-8">
                        <label htmlFor="profileInput" className="cursor-pointer">
                            <img
                                src={previewImage ? previewImage : "/profile.png"}
                                alt="profile"
                                className="w-24 h-24 rounded-full border-2"
                            />
                        </label>
                        <input
                            type="file"
                            id="profileInput"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleChange(e)}
                            disabled={!isEditAble}
                        />
                    </div>
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
                        <div className="sm:col-span-6 lg:col-span-4">
                            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-6 md:col-span-3">
                                    {renderSingleInput("email")}
                                </div>

                                {
                                    otpVerifySuccess && <CheckCircleIcon
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
                                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base  text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                                        onChange={(e) => setOTP((e.target as HTMLInputElement).value)}
                                                    />
                                                </div>
                                            </div>
                                        }

                                        {!otpVerifySuccess &&
                                            <div className={`sm:col-span-2 md:col-span-3 ${otpSendSuccess ? "sm:mt-8" : "md:mt-8"}`}>
                                                <button
                                                    type="button"
                                                    onClick={otpSendSuccess ? verifyOTP : sendOTP}
                                                    className="rounded-md bg-teal-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                                                >
                                                    Verify {otpSendSuccess ? "OTP" : "Email"}
                                                </button>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("role")}
                        </div>

                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                    <button onClick={() => reset()} disabled={!isEditAble} type="button" className="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
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

export default Profile