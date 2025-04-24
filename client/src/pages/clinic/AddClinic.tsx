import { useEffect, useState } from "react"
import useDynamicForm, { FieldConfig } from "../../hooks/useDynamicForm"
import { customValidator } from "../../utils/validator"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"
import { idbHelpers } from "../../indexDB"
import { IClinic } from "../../models/clinic.interface"
import { useImagePreview } from "../../context/ImageContext"
import { Box, Button, Divider, Grid2, Paper } from "@mui/material"
import DataContainer, { DataContainerConfig } from "../../components/DataContainer"
import Toast from "../../components/Toast"
import { useAddClinicMutation, useGetClinicByIdQuery, useUpdateClinicMutation } from "../../redux/apis/clinic.api"

const fields: FieldConfig[] = [
    {
        name: "name",
        placeholder: "Clinic Name",
        type: "text",
        rules: { required: true, min: 2, max: 50 }
    },
    {
        name: "contactInfo",
        placeholder: "Phone Number",
        type: "text",
        rules: { required: true, pattern: /^[6-9]\d{9}$/ }
    },
    {
        name: "email",
        placeholder: "Email Address",
        type: "text",
        rules: { required: false, email: true }
    },
    {
        name: "startDate",
        placeholder: "Start Date",
        type: "date",
        rules: { required: true }
    },
    {
        name: "endDate",
        placeholder: "End Date",
        type: "date",
        rules: { required: true }
    },
    {
        name: "amount",
        placeholder: "Amount",
        type: "text",
        rules: { required: true, number: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
    },
    {
        name: "alternateContactInfo",
        placeholder: "Alternate Phone Number",
        type: "text",
        rules: { required: false, pattern: /^[6-9]\d{9}$/ }
    },
    {
        name: "street",
        placeholder: "Street Address",
        type: "text",
        rules: { required: true, min: 2, max: 500 }
    },
    {
        name: "city",
        placeholder: "City",
        type: "text",
        rules: { required: true, min: 2, max: 100 }
    },
    {
        name: "state",
        placeholder: "State",
        type: "text",
        rules: { required: true, min: 2, max: 100 }
    },
    {
        name: "country",
        placeholder: "Country",
        type: "select",
        options: [
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
        placeholder: "Logo",
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
    const [clinic, setClinic] = useState<IClinic | null>(null)

    // Hooks
    const { id } = useParams()
    const { setPreviewImages } = useImagePreview()
    const navigate = useNavigate()

    // Queries and Mutations
    const [createClinic, { data: addData, isLoading: addLoading, error: addError, isSuccess: isAddSuccess, isError: isAddError }] = useAddClinicMutation()
    const { data: clinicData, isLoading, isFetching } = useGetClinicByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })
    const [updateClinic, { data: updateData, isLoading: updateLoading, error: updateError, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateClinicMutation()

    const config: DataContainerConfig = {
        pageTitle: id ? "Edit Clinic" : "Add Clinic",
        backLink: "../",
    }

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
        if (isAddSuccess) {
            const timeout = setTimeout(() => {
                navigate("/clinics")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isAddSuccess])

    useEffect(() => {
        if (isUpdateSuccess) {
            const timeout = setTimeout(() => {
                navigate("/clinics")
            }, 2000);
            return () => clearTimeout(timeout)
        }
    }, [isUpdateSuccess])

    return <>
        {isAddSuccess && <Toast type="success" message={addData?.message} />}
        {isAddError && <Toast type="error" message={addError as string} />}

        {isUpdateSuccess && <Toast type={updateData === "No Changes Detected" ? "info" : "success"} message={updateData as string} />}
        {isUpdateError && <Toast type="error" message={updateError as string} />}

        <Box>
            <DataContainer config={config} />
            <Paper sx={{ mt: 2, pt: 4, pb: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container columnSpacing={2} rowSpacing={3} sx={{ px: 3 }} >

                        {/* Name */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("name")}
                        </Grid2>

                        {/* Contact Info */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("contactInfo")}
                        </Grid2>

                        {/* Email */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("email")}
                        </Grid2>

                        {/* Start Date */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("startDate")}
                        </Grid2>

                        {/* End Date */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("endDate")}
                        </Grid2>

                        {/* Amount */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("amount")}
                        </Grid2>

                        {/* Alternate Phone Number */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("alternateContactInfo")}
                        </Grid2>

                        {/* Street Address */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("street")}
                        </Grid2>

                        {/* City */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("city")}
                        </Grid2>

                        {/* State */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("state")}
                        </Grid2>

                        {/* Country */}
                        <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
                            {renderSingleInput("country")}
                        </Grid2>

                        {/* Logo */}
                        <Grid2 size={{ xs: 12 }}>
                            {renderSingleInput("logo")}
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

export default AddClinic

