import { useEffect, useState } from "react"
import useDynamicForm from "../../components/useDynamicForm"
import { FieldConfig } from "../../models/fieldConfig.interface"
import { customValidator } from "../../utils/validator"
import { toast } from "../../utils/toast"
import { useNavigate, useParams } from "react-router-dom"
import Loader from "../../components/Loader"
import { ISupplier } from "../../models/supplier.interface"
import { useAddSupplierMutation, useGetSupplierByIdQuery, useUpdateSupplierMutation } from "../../redux/apis/supplier.api"
import { idbHelpers } from "../../indexDB"

const fields: FieldConfig[] = [
    {
        name: "name",
        label: "Supplier Name",
        placeholder: "Enter Suppliers Name",
        type: "text",
        rules: { required: true, min: 2, max: 50 }
    },
    {
        name: "phone",
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
        name: "address",
        type: "formGroup",
        object: true,
        formGroup: {
            city: {
                name: "city",
                label: "City",
                placeholder: "Enter City",
                type: "text",
                className: "sm:col-span-3 xl:col-span-2 mb-6",
                rules: { required: true, min: 2, max: 50 }
            },
            state: {
                name: "state",
                label: "State",
                placeholder: "Enter State",
                type: "text",
                className: "sm:col-span-3 xl:col-span-2 mb-6",
                rules: { required: true, min: 2, max: 50 }
            },
            country: {
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
                className: "sm:col-span-3 xl:col-span-2 mb-8",
                rules: { required: false, min: 2, max: 50 }
            },
            street: {
                name: "street",
                label: "Street Address",
                placeholder: "Enter Street Address",
                type: "textarea",
                className: "sm:col-span-3 xl:col-span-2 ",
                rules: { required: false, min: 2, max: 100 }
            },
        },
        rules: {}
    },
]

const defaultValues: ISupplier = {
    name: "",
    phone: "",
    email: "",
    address: {
        city: "",
        state: "",
        street: "",
        country: "India",
    },
}

const AddSupplier = () => {

    // Hooks
    const navigate = useNavigate()
    const { id } = useParams()
    const [supplier, setSupplier] = useState<ISupplier | null>(null)

    // Queries and Mutations
    const [addSupplier, { data: addSupplierData, isLoading: addSupplierLoading, error: supplierErrorData, isSuccess: supplierAddSuccess, isError: supplierCreateError }] = useAddSupplierMutation()
    const { data: supplierData, isFetching, isLoading, error: getSupplierErrorMessage, isError: getSupplierError } = useGetSupplierByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })
    const [updateSupplier, { data: updateMessage, isLoading: updateSupplierLoading, error: updateErrorMessage, isSuccess: updateSuccess, isError: updateError }] = useUpdateSupplierMutation()

    // Custom Validator
    const schema = customValidator(fields)

    // Submit Function
    const onSubmit = (data: any) => {

        if (supplier && supplier._id) {
            if (navigator.onLine) {
                updateSupplier({ supplierData: data, id: supplier._id })
            } else {
                idbHelpers.update({ storeName: "suppliers", endpoint: "supplier/update-supplier", data, _id: supplier._id })
            }
        } else {
            if (navigator.onLine) {
                addSupplier(data)
            } else {
                idbHelpers.add({ storeName: "suppliers", endpoint: "supplier/create-supplier", data })
            }
        }
    }

    // Dynamic Form
    const { renderSingleInput, handleSubmit, setValue, reset }
        = useDynamicForm({ schema, fields, onSubmit, defaultValues })

    useEffect(() => {
        if (id) {
            if (supplierData) {
                setSupplier(supplierData);
            } else if (!navigator.onLine && !isFetching && !isLoading) {
                const fetchSupplier = async () => {
                    const offlineSupplier = await idbHelpers.get({ storeName: "suppliers", _id: id });

                    setSupplier(offlineSupplier);
                };
                fetchSupplier();
            }
        }
    }, [id, supplierData]);

    useEffect(() => {
        if (id && supplier) {
            setValue("name", supplier.name)
            setValue("phone", supplier.phone.toString() || "")
            setValue("email", supplier?.email)
            setValue("address.city", supplier.address.city)
            setValue("address.state", supplier.address.state)
            setValue("address.country", supplier.address.country)
            setValue("address.street", supplier.address.street)
        }
    }, [id, supplier])

    useEffect(() => {
        if (supplierAddSuccess) {
            toast.showSuccess(addSupplierData.message)
            reset()
            navigate("/suppliers")
        }
        if (updateSuccess) {
            toast.showSuccess(updateMessage)
        }

        if (supplierCreateError) {
            toast.showError(supplierErrorData as string)
        }

        if (getSupplierError) {
            toast.showError(getSupplierErrorMessage as string)
        }

        if (updateError) {
            toast.showError(updateErrorMessage as string)
        }
    }, [addSupplierData, supplierAddSuccess, supplierErrorData, supplierCreateError, getSupplierError, getSupplierErrorMessage, updateError, updateSuccess, updateMessage, updateErrorMessage])

    return <>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8">
            <div className="flex justify-between">
                <h2 className="text-lg font-bold text-gray-900">{id ? "Update Supplier" : "Add Supplier"}</h2>
                <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => navigate("/suppliers")}
                >
                    Back
                </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        {/* Supplier Name */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("name")}
                        </div>

                        {/* Phone Number*/}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("phone")}
                        </div>

                        {/* Email */}
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("email")}
                        </div>

                        {/* Address */}
                        <div className="sm:col-span-6">
                            {renderSingleInput("address")}
                        </div>

                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                    {
                        addSupplierLoading || updateSupplierLoading
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

export default AddSupplier

