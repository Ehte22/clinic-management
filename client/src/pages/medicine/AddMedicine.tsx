import { useEffect, useState } from "react"
import useDynamicForm, { FieldConfig } from "../../hooks/useDynamicForm"
import { customValidator } from "../../utils/validator"
import { useNavigate, useParams } from "react-router-dom"
import { z } from "zod"
import { idbHelpers } from "../../indexDB"
import { Box, Button, Divider, Grid2, Paper } from "@mui/material"
import DataContainer, { DataContainerConfig } from "../../components/DataContainer"
import Toast from "../../components/Toast"
import { IMedicine } from "../../models/medicine.interface"
import { useAddMedicineMutation, useGetMedicineByIdQuery, useUpdateMedicineMutation } from "../../redux/apis/medicineApi"
import { useGetSuppliersQuery } from "../../redux/apis/supplier.api"

const AddClinic = () => {
  const [medicine, setMedicine] = useState<IMedicine | null>(null)
  const [supplierOptions, setSupplierOptions] = useState<{ label: string, value?: string }[]>([])

  // Hooks
  const { id } = useParams()
  const navigate = useNavigate()

  // Queries and Mutations
  const [addMedicine, { data: addData, isLoading: addLoading, error: addError, isSuccess: isAddSuccess, isError: isAddError }] = useAddMedicineMutation()
  const { data, isLoading, isFetching } = useGetMedicineByIdQuery(id || "", {
    skip: !id || !navigator.onLine
  })
  const [updateMedicine, { data: updateData, isLoading: updateLoading, error: updateError, isSuccess: isUpdateSuccess, isError: isUpdateError }] = useUpdateMedicineMutation()
  const { data: suppliers, isSuccess: isSupplierFetchSuccess } = useGetSuppliersQuery({ isFetchAll: true })

  const config: DataContainerConfig = {
    pageTitle: id ? "Edit Medicine" : "Add Medicine",
    backLink: "../",
  }

  const fields: FieldConfig[] = [
    {
      name: "medicineName",
      placeholder: "Name",
      type: "text",
      rules: { required: true, min: 2, max: 50 }
    },
    {
      name: "category",
      placeholder: "Category",
      type: "text",
      rules: { required: true }
    },
    {
      name: "mg",
      placeholder: "MG",
      type: "text",
      rules: { required: true }
    },
    {
      name: "medicineType",
      placeholder: "Type",
      type: "text",
      rules: { required: true }
    },
    {
      name: "label",
      placeholder: "Label",
      type: "text",
      rules: { required: false }
    },
    {
      name: "expiryDate",
      placeholder: "Expiry Date",
      type: "date",
      rules: { required: true }
    },
    {
      name: "price",
      placeholder: "Price Per Unit",
      type: "text",
      rules: { required: true }
    },
    {
      name: "stock",
      placeholder: "Stock",
      type: "text",
      rules: { required: true, number: true, pattern: /^\d+$/, patternMessage: "Only numbers are allowed" }
    },
    {
      name: "supplier",
      placeholder: "Select Supplier",
      type: "autoComplete",
      options: supplierOptions,
      rules: { required: true }
    },
  ]

  const defaultValues = {
    medicineName: "",
    category: "",
    mg: "",
    medicineType: "",
    label: "",
    expiryDate: "",
    price: "",
    stock: "",
    supplier: "",
  }

  // Custom Validator
  const schema = customValidator(fields)

  type FormValues = z.infer<typeof schema>

  // Submit Function
  const onSubmit = (data: FormValues) => {

    const medicineData = data as IMedicine

    if (medicine && medicine._id) {
      if (navigator.onLine) {
        updateMedicine({ medicineData, id: medicine._id })
      } else {
        idbHelpers.update({ storeName: "medicines", endpoint: "medicine/update-medicine", _id: medicine._id, data })
      }
    } else {
      if (navigator.onLine) {
        addMedicine(medicineData)
      } else {
        idbHelpers.add({ storeName: "medicines", endpoint: "medicine/create-medicine", data: { ...data, status: "active" } })
      }
    }
  }

  // Dynamic Form
  const { renderSingleInput, handleSubmit, setValue, reset }
    = useDynamicForm({ schema, fields, onSubmit, defaultValues })

  useEffect(() => {
    if (isSupplierFetchSuccess) {
      const x = suppliers.result.map((item) => {
        return { label: item.name, value: item._id }
      })

      setSupplierOptions(x)
    }

  }, [isSupplierFetchSuccess])


  useEffect(() => {
    if (id) {
      if (data && navigator.onLine) {
        setMedicine(data);
      } else if (!navigator.onLine && !isFetching && !isLoading) {
        const fetchData = async () => {
          const offlineData = await idbHelpers.get({ storeName: "medicines", _id: id });
          setMedicine(offlineData);
        };
        fetchData();
      }
    }
  }, [id, data]);

  useEffect(() => {
    if (id && medicine) {
      setValue("medicineName", medicine.medicineName)
      setValue("category", medicine.category)
      setValue("mg", medicine.mg.toString() || "")
      setValue("medicineType", medicine.medicineType)
      setValue("label", medicine.label)
      setValue("expiryDate", medicine.expiryDate)
      setValue("price", medicine.price.toString() || "")
      setValue("stock", medicine.stock.toString() || "")
      setValue("supplier", medicine.supplier)
    }
  }, [id, medicine])

  useEffect(() => {
    if (isAddSuccess) {
      const timeout = setTimeout(() => {
        navigate("/medicines")
      }, 2000);
      return () => clearTimeout(timeout)
    }
  }, [isAddSuccess])

  useEffect(() => {
    if (isUpdateSuccess) {
      const timeout = setTimeout(() => {
        navigate("/medicines")
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
              {renderSingleInput("medicineName")}
            </Grid2>

            {/* Category */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("category")}
            </Grid2>

            {/* MG */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("mg")}
            </Grid2>

            {/* Medicine Type */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("medicineType")}
            </Grid2>

            {/* Label */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("label")}
            </Grid2>

            {/* Expiry Date */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("expiryDate")}
            </Grid2>

            {/* Price Per Unit */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("price")}
            </Grid2>

            {/* Stock */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("stock")}
            </Grid2>

            {/* Supplier */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 4 }}>
              {renderSingleInput("supplier")}
            </Grid2>

          </Grid2>

          <Divider sx={{ mt: 4, mb: 3 }} />

          <Box sx={{ textAlign: "end", px: 3 }}>
            <Button
              type='button'
              onClick={() => reset()}
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

