// import React, { useEffect, useState } from 'react';
import React, { useEffect, useState } from 'react';
import useDynamicForm from '../../components/useDynamicForm';
import { FieldConfig } from '../../models/fieldConfig.interface';
import { customValidator } from '../../utils/validator';
import { Medicine, useAddMedicineMutation, useGetSingleMedicineQuery, useUpdateMedicineMutation } from '../../redux/apis/medicineApi';
import { toast } from '../../utils/toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetSuppliersQuery } from '../../redux/apis/supplier.api';
import { idbHelpers } from '../../indexDB';

const fields: FieldConfig[] = [
  { name: 'medicineName', rules: { required: true }, placeholder: "Enter Medicine Name", type: "text", label: "Medicine Name" },
  { name: 'category', rules: { required: true }, placeholder: "Enter Category", type: "text", label: "Category" },
  { name: 'label', rules: { required: false }, placeholder: "Enter Label", type: "text", label: "Label Name" },
  { name: 'expiryDate', rules: { required: true }, placeholder: "Enter Expiry Date", type: "date", label: "Expiry Date" },
  { name: 'stock', rules: { required: true }, placeholder: "Enter Stock", type: "text", label: "Stock" },
  { name: 'mg', rules: { required: true }, placeholder: "Enter MG", type: "text", label: "MG" },
  { name: 'price', rules: { required: true }, placeholder: "Enter Price", type: "text", label: "Price Per Unit" },
  { name: 'medicineType', rules: { required: true }, placeholder: "Enter Medicine Type", type: "text", label: "Medicine Type" },
  // { name: 'quantity', rules: { required: true }, placeholder: "Enter Quantity", type: "text", label: "Quantity" },
  // { name: 'manufacturer', rules: { required: true }, placeholder: "Enter Manufacturer Name", type: "text", label: "Manufacturer Name" },
  // { name: 'batchNumber', rules: { required: true }, placeholder: "Enter Batch Number", type: "text", label: "Batch Number" },
  // { name: 'discount', rules: { required: true }, placeholder: "Enter Discount", type: "text", label: "Discount" },
  // { 
  //   name: 'supplier',
  //    rules: { required: true },
  //     placeholder: "select supplier",
  //      type: "searchSelect",
  //       label: "Supplier",
  //       // options:

  //      },
  // { name: 'purchasedPrice', rules: { required: true }, placeholder: "Enter Purchased Price", type: "text", label: "Purchased Price" },
];

const defaultValues = {
  medicineName: "",
  expiryDate: "",
  stock: "",
  mg: "",
  price: "",
  //  stock: "",
  label: "",
  medicineType: "",
  // manufacturer: "",
  // batchNumber: "",
  // discount: "",
  supplier: "",
  // purchasedPrice: "",

};

const AddMedicine: React.FC = (): any => {
  const [updatedFields, setUpdatedFields,] = useState<FieldConfig[]>([...fields]);
  const { data: suppliers, isSuccess: getSupplierSuccess } = useGetSuppliersQuery({ isFetchAll: true })


  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const navigate = useNavigate()
  const schema = customValidator(updatedFields)
  const [AddMedicine, { isSuccess }] = useAddMedicineMutation()
  const [update, { isSuccess: updateSuccess }] = useUpdateMedicineMutation()
  const { id } = useParams()
  const { data } = useGetSingleMedicineQuery(id || "", {
    skip: !id || !navigator.onLine
  })
  const onSubmit = (data: any) => {
    const supplier = suppliers?.result?.find(item => item.name === data.supplier)


    if (medicine && medicine._id) {
      if (navigator.onLine) {
        update({ ...data, _id: id, supplier: supplier?._id })
      } else {
        idbHelpers.update({ storeName: "medicines", endpoint: "medicine/update-medicine", _id: medicine._id, data: { ...data, supplier: supplier?._id } })
      }
    } else {

      if (navigator.onLine) {
        AddMedicine({ ...data, supplier: supplier?._id })
      } else {
        idbHelpers.add({ storeName: "medicines", endpoint: "medicine/add-medicine", data: { ...data, supplier: supplier?._id } })
      }
    }
  }
  const { renderSingleInput, handleSubmit, setValue, reset } = useDynamicForm({
    schema,
    fields: updatedFields,
    onSubmit,
    defaultValues,
  });


  useEffect(() => {
    if (getSupplierSuccess && suppliers) {
      const clinics = suppliers.result.map((item) => ({
        label: item.name,
        value: item.name
      }));

      setUpdatedFields([...fields,
      {
        name: "supplier",
        label: "Supplier",
        type: "searchSelect",
        options: [
          { label: "Select Supplier", value: "", disabled: true },
          ...clinics
        ],
        rules: { required: true }
      }
      ])

    }
  }, [suppliers, getSupplierSuccess, fields]);


  useEffect(() => {
    if (id) {
      if (data && navigator.onLine) {
        setMedicine(data);
      } else {
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

      const supplier = suppliers?.result.find(item => item._id === medicine.supplier)
      if (supplier) {
        setValue("supplier", supplier.name)
      }

      setValue("medicineName", medicine.medicineName)
      setValue("category", medicine.category)
      setValue("label", medicine.label)
      // setValue("manufacturer", medicine.manufacturer)
      setValue("expiryDate", medicine.expiryDate)
      setValue("stock", medicine.stock)
      // setValue("batchNumber", medicine.batchNumber)
      setValue("mg", medicine.mg.toString() || "")
      setValue("price", medicine.price)
      // setValue("discount", medicine.discount)
      // setValue("purchasedPrice", medicine.purchasedPrice)
      setValue("stock", medicine.stock)
      // setValue("clinicId", medicine.clinicId)
      setValue("medicineType", medicine.medicineType)
      setValue("medicineName", medicine.medicineName)
      setValue("category", medicine.category)
      setValue("label", medicine.label)
      // setValue("manufacturer", medicine.manufacturer)
      setValue("expiryDate", medicine.expiryDate)
      setValue("stock", medicine.stock.toString() || "")
      // setValue("batchNumber", medicine.batchNumber)
      setValue("mg", medicine.mg.toString() || "")
      setValue("price", medicine.price.toString() || "")
      // setValue("discount", medicine.discount)
      // setValue("supplier", medicine.supplier)
      // setValue("purchasedPrice", medicine.purchasedPrice)
      setValue("quantity", medicine.quantity || "")
      // setValue("clinicId", medicine.clinicId)
      setValue("medicineType", medicine.medicineType)

    }
  }, [id, medicine, suppliers])

  useEffect(() => {
    if (isSuccess) {
      toast.showSuccess("Medicine Added Success")
      navigate("/all-medicines")
      reset()
    }
  }, [isSuccess])
  useEffect(() => {
    if (updateSuccess) {
      toast.showSuccess("Medicine Update Success")
      reset()
      navigate("/all-medicines")
    }
  }, [updateSuccess])

  return <>
    <div className="grid grid-cols-1 gap-x-8 gap-y-8">
      <div className="flex justify-between">
        {/* <h2 className="text-lg font-bold text-gray-900">{id ? "Update Clinic" : "Add Clinic"}</h2> */}
        <h2 className="text-lg font-bold text-gray-900">Add Medicine</h2>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => navigate("/all-medicines")}
        >
          Back
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

            <div className="sm:col-span-3 xl:col-span-2">
              {renderSingleInput("medicineName")}
            </div>

            <div className="sm:col-span-3 xl:col-span-2">
              {renderSingleInput("category")}
            </div>

            <div className="sm:col-span-3 xl:col-span-2">
              {renderSingleInput("mg")}
            </div>

            <div className="sm:col-span-3 xl:col-span-2">
              {renderSingleInput("medicineType")}
            </div>
            <div className="sm:col-span-3 xl:col-span-2">
              {renderSingleInput("label")}
            </div>
            <div className="sm:col-span-3 xl:col-span-2">
              {renderSingleInput("expiryDate")}
            </div>

            <div className="sm:col-span-3 xl:col-span-2">
              {renderSingleInput("price")}
            </div>
            <div className="sm:col-span-3 xl:col-span-2">
              {renderSingleInput("stock")}
            </div>
            <div className="sm:col-span-3 xl:col-span-2">
              {renderSingleInput("supplier")}
              {/* <p>Hello</p> */}
            </div>

          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <button type="button" onClick={() => navigate("/all-medicines")} className="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
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


};


export default AddMedicine;
