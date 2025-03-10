import useDynamicForm from "../../components/useDynamicForm"
import { FieldConfig } from "../../models/fieldConfig.interface"
import { customValidator } from "../../utils/validator"
import { useSendOTPMutation, useVerifyOTPMutation } from "../../redux/apis/auth.api"
import { useContext, useEffect, useState } from "react"
import { toast } from "../../utils/toast"
import { CheckCircleIcon } from "@heroicons/react/24/outline"
import { useGetClinicsQuery } from "../../redux/apis/clinic.api"
import { useNavigate, useParams } from "react-router-dom"
import { useCreateUserMutation, useGetUserByIdQuery, useUpdateUserMutation } from "../../redux/apis/user.api"
import { ImagePreviewContext } from "../../App"
import { z } from "zod"
import Loader from "../../components/Loader"
import { idbHelpers } from "../../indexDB"
import { IUser } from "../../models/user.interface"

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

    {
        name: "role",
        label: "Role",
        type: "select",
        options: [
            { label: "Select Role", value: "", disabled: true },
            { label: "Clinic Admin", value: "Clinic Admin" },
            { label: "Doctor", value: "Doctor" },
            { label: "Receptionist", value: "Receptionist" }
        ],
        rules: { required: true }
    },


]

const defaultValues = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    profile: "",
    clinicId: ""
}

const AddUser = () => {

    // hooks
    const navigate = useNavigate()
    const { id } = useParams()
    const { setPreviewImages } = useContext(ImagePreviewContext)

    // States
    const [OTP, setOTP] = useState("")
    const [updatedFields, setUpdatedFields] = useState<FieldConfig[]>([...fields]);
    const [user, setUser] = useState<IUser | null>(null)

    // Queries and Mutations
    const [createUser, { data: registerData, isLoading: createUserLoading, error: registerErrorMessage, isSuccess: registerSuccess, isError: registerError }] = useCreateUserMutation()
    const [updateUser, { data: updateUserMessage, isLoading: updateUserLoading, error: updateUserErrorMessage, isSuccess: updateUserSuccess, isError: updateUserError }] = useUpdateUserMutation()
    const [sendOtp, { data: otpSendMessage, isLoading: isSendOtpLoading, error: otpSendErrorMessage, isSuccess: otpSendSuccess, isError: otpSendError }] = useSendOTPMutation()
    const [verifyOtp, { data: otpVerifyMessage, isLoading: isVerifyOtpLoading, error: otpVerifyErrorMessage, isSuccess: otpVerifySuccess, isError: otpVerifyError }] = useVerifyOTPMutation()
    const { data: clinicData, isSuccess: getClinicsSuccess } = useGetClinicsQuery({ isFetchAll: true })
    const { data: userData } = useGetUserByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })

    // Function for send OTP
    const sendOTP = () => {
        const email = getValues("email")
        if (email && navigator.onLine) {
            sendOtp({ username: email })
        } else if (!navigator.onLine) {
            toast.showInfo("You are offline")
        }
    }

    // Function for Verify OTP
    const verifyOTP = () => {
        const email = getValues("email")
        if (email && OTP && navigator.onLine) {
            verifyOtp({ username: email, otp: OTP })
        } else if (!navigator.onLine) {
            toast.showInfo("You are offline")
        }
    }

    // Custom Validator
    const schema = customValidator(updatedFields)

    type FormValues = z.infer<typeof schema>

    // Submit Function
    const onSubmit = (data: FormValues) => {
        const clinic = clinicData?.result?.find(item => item.name === data.clinicId)

        let updatedData = data

        if (clinic) {
            updatedData = { ...data, clinicId: clinic?._id }
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

        if (user && user._id) {
            const email = getValues("email")

            if (email === user.email) {
                if (navigator.onLine) {
                    updateUser({ userData: formData, id: user._id })
                } else {
                    idbHelpers.update({ storeName: "users", endpoint: "user/update-user", _id: user._id, data: updatedData, isFormData: true })
                }
            } else {
                toast.showError("Please verify your email address")
            }

        } else {
            if (otpVerifySuccess) {
                if (navigator.onLine) {
                    createUser(formData)
                } else {
                    idbHelpers.add({ storeName: "users", endpoint: "user/add-clinic", data: { ...updatedData, status: "active" }, isFormData: true })
                }
            } else {
                toast.showError("Please verify your email address")
            }
        }
    }

    // Dynamic Form Component
    const { renderSingleInput, handleSubmit, getValues, disableField, setValue, reset } =
        useDynamicForm({ schema, fields: updatedFields, onSubmit, defaultValues })

    useEffect(() => {
        if (id) {
            if (userData && navigator.onLine) {
                setUser(userData)
            } else {
                const fetchData = async () => {
                    const offlineData = await idbHelpers.get({ storeName: "users", _id: id })
                    setUser(offlineData)
                }
                fetchData()
            }
        }
    }, [id, userData])


    useEffect(() => {
        if (getClinicsSuccess && clinicData) {
            const clinics = clinicData.result.map((item) => ({
                label: item.name,
                value: item.name
            }));

            setUpdatedFields([
                ...fields,
                {
                    name: "clinicId",
                    label: "Clinic",
                    type: "searchSelect",
                    options: [
                        { label: "Select Clinic", value: "", disabled: true },
                        ...clinics
                    ],
                    rules: { required: true }
                }
            ]);
        } else {
            setUpdatedFields(fields.filter((field) => field.name !== "clinicId"));
        }
    }, [clinicData, getClinicsSuccess, fields]);


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
            reset()
            navigate("/users")
        }

        if (updateUserSuccess) {
            toast.showSuccess(updateUserMessage)
        }

    }, [otpSendMessage, otpSendSuccess, otpVerifyMessage, otpVerifySuccess, registerData, registerSuccess, updateUserMessage, updateUserSuccess])

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

        if (updateUserError) {
            toast.showError(updateUserErrorMessage as string)
        }
    }, [otpSendErrorMessage, otpSendError, otpVerifyErrorMessage, otpVerifyError, registerErrorMessage, registerError, updateUserError, updateUserErrorMessage])

    useEffect(() => {
        if (id && user) {
            setValue("firstName", user.firstName || "")
            setValue("lastName", user.lastName || "")
            setValue("email", user.email || "")
            setValue("phone", user.phone?.toString() || "")
            setValue("role", user.role || "")

            if (user.clinicId) {
                const clinic = clinicData?.result.find(item => item._id === user.clinicId)
                setValue("clinicId", clinic?.name || "")
            }


            if (user.profile) {
                setValue("profile", user.profile)
                setPreviewImages([user.profile])
            }
        }
    }, [id, user, clinicData])

    return <>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8">
            <div className="flex justify-between">
                <h2 className="text-lg font-bold text-gray-900">{id ? "Update User" : "Add User"}</h2>
                <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => navigate("/users")}
                >
                    Back
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
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
                                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base  text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                                                            className="rounded-md bg-teal-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
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

                        {/* Role */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("role")}
                        </div>

                        {/* Clinic */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("clinicId")}
                        </div>

                        {/* Profile */}
                        <div className="sm:col-span-6">
                            {renderSingleInput("profile")}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                    {
                        createUserLoading || updateUserLoading
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
            </form >
        </div >
    </>

}


export default AddUser