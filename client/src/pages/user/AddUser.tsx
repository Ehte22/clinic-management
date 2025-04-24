import useDynamicForm, { FieldConfig } from "../../hooks/useDynamicForm"
import { customValidator } from "../../utils/validator"
import { useSendOTPMutation, useVerifyOTPMutation } from "../../redux/apis/auth.api"
import { useEffect, useState } from "react"
import { toast } from "../../utils/toast"
import { useGetClinicsQuery } from "../../redux/apis/clinic.api"
import { useNavigate, useParams } from "react-router-dom"
import { useAddUserMutation, useGetUserByIdQuery, useUpdateUserMutation } from "../../redux/apis/user.api"
import { z } from "zod"
import { idbHelpers } from "../../indexDB"
import { IUser } from "../../models/user.interface"
import { useImagePreview } from "../../context/ImageContext"
import Toast from "../../components/Toast"
import DataContainer, { DataContainerConfig } from "../../components/DataContainer"
import { Box, Button, Divider, Grid2, Paper, TextField } from "@mui/material"
import { textFieldStyles } from "../../components/Inputs"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const fields: FieldConfig[] = [
    {
        name: "firstName",
        placeholder: "First Name",
        type: "text",
        rules: { required: true, min: 2, max: 16 }
    },
    {
        name: "lastName",
        placeholder: "Last Name",
        type: "text",
        rules: { required: true, min: 2, max: 16 }
    },
    {
        name: "email",
        placeholder: "Email Address",
        type: "text",
        rules: { required: true, email: true }
    },
    {
        name: "phone",
        placeholder: "Phone Number",
        type: "text",
        rules: { required: true, pattern: /^[6-9]\d{9}$/ }
    },
    {
        name: "profile",
        placeholder: "Profile",
        type: "file",
        rules: { required: false, file: true, maxSize: 10 }
    },

    {
        name: "role",
        placeholder: "Role",
        type: "select",
        options: [
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
    const { setPreviewImages } = useImagePreview()

    // States
    const [OTP, setOTP] = useState("")
    const [updatedFields, setUpdatedFields] = useState<FieldConfig[]>([...fields]);
    const [user, setUser] = useState<IUser | null>(null)
    const [showEmailError, setShowEmailError] = useState<boolean>(false)

    // Queries and Mutations
    const [createUser, { data: addData, isLoading: addLoading, error: addError, isSuccess: isAddSuccess, isError: isAddError }] = useAddUserMutation()
    const [updateUser, { data: updateData, isLoading: updateLoading, error: updateError, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateUserMutation()
    const [sendOtp, { data: otpSendMessage, isLoading: isSendOtpLoading, error: otpSendErrorMessage, isSuccess: otpSendSuccess, isError: otpSendError }] = useSendOTPMutation()
    const [verifyOtp, { data: otpVerifyMessage, isLoading: isVerifyOtpLoading, error: otpVerifyErrorMessage, isSuccess: otpVerifySuccess, isError: otpVerifyError }] = useVerifyOTPMutation()
    const { data: clinicData, isSuccess: getClinicsSuccess } = useGetClinicsQuery({ isFetchAll: true })
    const { data: userData } = useGetUserByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit User" : "Add User",
        backLink: "../",
    }

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
                setShowEmailError(true)
            }

        } else {
            if (otpVerifySuccess) {
                if (navigator.onLine) {
                    createUser(formData)
                } else {
                    idbHelpers.add({ storeName: "users", endpoint: "user/add-clinic", data: { ...updatedData, status: "active" }, isFormData: true })
                }
            } else {
                setShowEmailError(true)
            }
        }
    }

    // Dynamic Form Component
    const { renderSingleInput, handleSubmit, getValues, errors, setValue, reset, disableField } =
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
                    placeholder: "Clinic",
                    type: "autoComplete",
                    options: [
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

    useEffect(() => {
        if (otpVerifySuccess) {
            disableField("email", true)
        }
    }, [otpVerifySuccess])

    useEffect(() => {
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                navigate("/users")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                navigate("/users")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isUpdateSuccess])

    useEffect(() => {
        if (showEmailError) {
            const timer = setTimeout(() => setShowEmailError(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [showEmailError])

    return <>
        {isAddSuccess && <Toast type="success" message={addData?.message} />}
        {isAddError && <Toast type="error" message={addError as string} />}

        {isUpdateSuccess && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
        {isUpdateError && <Toast type="error" message={updateError as string} />}

        {otpSendSuccess && <Toast type="success" message={otpSendMessage} />}
        {otpSendError && <Toast type="error" message={otpSendErrorMessage as string} />}

        {otpVerifySuccess && <Toast type="success" message={otpVerifyMessage as string} />}
        {otpVerifyError && <Toast type="error" message={otpVerifyErrorMessage as string} />}

        {showEmailError && <Toast type="error" message={"Please verify your email address"} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

                        {/* First Name */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("firstName")}
                        </Grid2>

                        {/* Last Name */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("lastName")}
                        </Grid2>

                        {/* Phone Number */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("phone")}
                        </Grid2>

                        {/* Email */}
                        <Grid2 size={{ xs: 12, lg: 8 }}>
                            <Grid2 container spacing={2}>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    {renderSingleInput("email")}
                                </Grid2>

                                <Grid2 size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>

                                    <Grid2 container spacing={2}>
                                        {otpVerifySuccess && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                                                <CheckCircleIcon sx={{ color: "#00c979" }} />
                                            </Box>
                                        )}

                                        {otpSendSuccess && !otpVerifySuccess && (
                                            <Paper sx={{ marginTop: 2 }}>
                                                <TextField
                                                    fullWidth
                                                    sx={textFieldStyles}
                                                    label="OTP"
                                                    placeholder="Enter OTP"
                                                    onChange={(e) => setOTP(e.target.value)}
                                                />
                                            </Paper>
                                        )}

                                        {!otpVerifySuccess &&
                                            <Box sx={{ marginTop: errors.email?.message ? 0 : 2, display: "flex", alignItems: "center" }}>
                                                <Button
                                                    loading={isSendOtpLoading || isVerifyOtpLoading}
                                                    variant="contained"
                                                    color="success"
                                                    onClick={otpSendSuccess ? verifyOTP : sendOTP}
                                                    sx={{ textTransform: 'none', backgroundColor: "#0777de" }}
                                                >
                                                    Verify {otpSendSuccess ? "OTP" : "Email"}
                                                </Button>
                                            </Box>
                                        }
                                    </Grid2>
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Role */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("role")}
                        </Grid2>

                        {/* Clinic */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("clinicId")}
                        </Grid2>

                        {/* Profile */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("profile")}
                        </Grid2>
                    </Grid2>

                    <Divider sx={{ mt: 4, mb: 3 }} />

                    <Box sx={{ textAlign: "end", px: 3 }}>
                        <Button
                            type='button'
                            onClick={() => { setPreviewImages([]), reset() }}
                            variant='contained'
                            sx={{ backgroundColor: "#F3F3F3", py: 0.65 }}>
                            Reset
                        </Button>
                        <Button
                            loading={id ? updateLoading : addLoading}
                            type='submit'
                            variant='contained'
                            sx={{ ml: 2, background: "#0777de", color: "white", py: 0.65 }}>
                            Save
                        </Button>
                    </Box>
                </Box>
            </Paper >
        </Box>
    </>

}


export default AddUser