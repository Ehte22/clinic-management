
import useDynamicForm from "../../components/useDynamicForm";
import { idbHelpers } from "../../indexDB";
import { FieldConfig } from "../../models/fieldConfig.interface";
import { useGetAllMedicinesQuery, useSellMedicineMutation } from "../../redux/apis/medicineApi";
import { useGetAllPrescriptionsQuery } from "../../redux/apis/prescriptionApi";
import { toast } from "../../utils/toast";
import { customValidator } from "../../utils/validator";
import { useEffect, useState } from "react";

const defaultValues = {
  pId: "",
  medicines: [{ mId: "", qty: "" }]
};

const SellMedicine = () => {
  const { data } = useGetAllMedicinesQuery({ page: 1, limit: 1000, filter: "" })
  const { data: allPrescription, isSuccess: presSuccess } = useGetAllPrescriptionsQuery()

  const [sellMed, { isSuccess }] = useSellMedicineMutation()

  const [selectedMed, setSelectedMed] = useState<{ label: string; value: string; disabled?: boolean }[]>([]);
  const [updatedFields, setUpdatedFields] = useState<FieldConfig[]>([]);


  useEffect(() => {
    if (presSuccess && allPrescription) {
      const patientOptions = allPrescription?.map((item: any) => ({
        label: item.patient?.name,
        value: item.patient?.name
      }));

      setUpdatedFields([
        {
          name: "pId",
          label: "Patient",
          type: "searchSelect",
          options: [{ label: "Select Patient", value: "", disabled: true }, ...patientOptions],
          rules: { required: true }
        },
        {
          name: "medicines",
          type: "formArray",
          formArray: [
            {
              name: "mId",
              label: "Medicine",
              placeholder: "Select Medicine",
              type: "select",
              options: [
                { label: "Select Medicine", value: "", disabled: true },
                ...selectedMed
              ],
              className: "sm:col-span-6",
              rules: { required: true }
            },
            {
              name: "qty",
              label: "Quantity",
              placeholder: "Enter Quantity",
              type: "number",
              className: "sm:col-span-6",
              rules: { required: true }
            }
          ],
          rules: { required: true }
        }
      ]);
    }
  }, [allPrescription, presSuccess, selectedMed]);

  const onSubmit = (value: any) => {
    const selectedPatient: any = allPrescription?.find((item: any) => item.patient?.name === value.pId);
    const formattedData = {
      medicines: value.medicines.map((med: any) => {
        const selectedMedicine = data?.result?.find((m: any) => m.medicineName === med.mId);
        return {
          mId: selectedMedicine ? selectedMedicine._id : null,
          qty: med.qty
        };
      })
    };
    // console.log("==========",{ ...formattedData, pId: selectedPatient?._id });

    if (navigator.onLine) {
      sellMed({ ...formattedData, pId: selectedPatient?._id });
    } else {
      idbHelpers.add({ storeName: "sellmedicines", endpoint: "medicine/sell-medicine", data: { ...formattedData, pId: selectedPatient?._id } })
    }

  };

  const schema = customValidator(updatedFields);
  const { renderSingleInput, handleSubmit, append, watch, reset } = useDynamicForm({
    schema,
    fields: updatedFields,
    onSubmit,
    defaultValues
  });

  useEffect(() => {
    append("medicines")
  }, [])

  const value = watch()

  // console.log("value", value);


  useEffect(() => {
    if (value.pId && allPrescription) {
      const selectedPatient: any = allPrescription.find((item: any) => item.patient.name === value.pId);
      if (selectedPatient) {
        const medicineOptions = selectedPatient.medical.map((med: any) => ({
          label: med.medicine,
          value: med.medicine
        }));
        setSelectedMed(medicineOptions);
      }
    }
  }, [allPrescription, value.pId]);

  useEffect(() => {
    if (isSuccess) {
      toast.showSuccess("Medicine Sell Success")
      reset()
    }
  }, [isSuccess])

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
            <div className="sm:col-span-6 xl:col-span-4">{renderSingleInput("pId")}</div>

            <div className="sm:col-span-12">
              {renderSingleInput("medicines")}
              {/* <button
                type="button"
                onClick={() => append("medicines")}
                className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
              >
                + Add More Medicine
              </button> */}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellMedicine;
