// import React, { useEffect, useState } from "react";
// import { z } from "zod";
// import { FieldConfig } from "../../models/fieldConfig.interface";
// import { IInvoice, useAddInvoiceMutation, useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from "../../redux/apis/invoiceApi";
// import { customValidator } from "../../utils/validator";
// import useDynamicForm from "../../components/useDynamicForm";
// import { IData, useGetAppointmentsQuery } from "../../redux/apis/appointment.api";
// import { useNavigate, useParams } from "react-router-dom";
// import { toast } from "../../utils/toast";
// import { idbHelpers } from "../../indexDB";

// export interface Invoice {
//     appointmentId?: IData;
//     issueDate: string;
//     dueDate: string;
//     paymentStatus: string;
//     paymentMethod: string;
//     tax: number;
//     discount: number;
//     totalAmount: number;
//     notes: string;
//     items: InvoiceItem[];
// }

// export interface InvoiceItem {
//     description: string;
//     quantity: number;
//     unitPrice: number;
//     total: number;
// }

// interface updatedInvoice {
//     total: number;
//     description: string;
//     quantity: number;
//     unitPrice: number;
// }
// const defaultValues = {
//     appointmentId: "",
//     issueDate: "",
//     dueDate: "",
//     paymentMethod: "",
//     tax: 0,
//     discount: 0,
//     totalAmount: 0,
//     notes: "",
//     items: [
//         {
//             description: "",
//             quantity: 1,
//             unitPrice: 0,
//             total: 0,
//         },
//     ],
// };

// const AddInvoice: React.FC = () => {
//     const [invoice, setInvoice] = useState<IInvoice | null>(null)
//     const [addInvoice, { isSuccess }] = useAddInvoiceMutation()
//     const [totalAmount, setTotalAmount] = useState<number>(0)
//     const [appointmentOptions, setAppointmentOptions] = useState<{ label: string, value: string, disabled?: boolean }[]>([{
//         label: "Select Appointment", value: "", disabled: true
//     }])
//     const [items, setItems] = useState(defaultValues.items)
//     const { data: Appointments, isSuccess: isAppointmentsFetchSuccess } = useGetAppointmentsQuery({})
//     const { id } = useParams()
//     const [updatedItem, setUpdatedItem] = useState<updatedInvoice[]>()
//     const [amount, setAmount] = useState({ tax: "", discount: "" })
//     const [updateInvoice, { isSuccess: isSuccessUpdate, }] = useUpdateInvoiceMutation()
//     const { data: invoices,
//     } = useGetInvoiceByIdQuery(id || "", {
//         skip: !id || !navigator.onLine
//     })

//     const fields: FieldConfig[] = [
//         {
//             name: "appointmentId",
//             label: "Appointment ID",
//             type: "select",
//             rules: { required: true },
//             options: appointmentOptions,
//         },
//         {
//             name: "issueDate",
//             label: "Issue Date",
//             type: "date",
//             rules: { required: true },
//         },
//         {
//             name: "dueDate",
//             label: "Due Date",
//             type: "date",
//             rules: { required: true },
//         },
//         {
//             name: "paymentMethod",
//             label: "Payment Method",
//             type: "select",
//             options: [
//                 { label: "Select Method", name: "Select Method", disabled: true },
//                 { name: "cash", label: "cash", value: "cash" },
//                 { name: "card", label: "card", value: "card" },
//                 { name: "online", label: "online", value: "online" },
//             ],
//             rules: { required: true },
//         },
//         {
//             name: "tax",
//             label: "Tax",
//             type: "number",
//             placeholder: "Enter Tax Amount or Percentage",
//             rules: { required: true, min: 0 },
//         },
//         {
//             name: "discount",
//             label: "Discount",
//             type: "number",
//             placeholder: "Enter Discount or Percentage",
//             rules: { required: true, min: 0 },
//         },
//         {
//             name: "notes",
//             label: "Notes",
//             type: "textarea",
//             placeholder: "Enter additional notes",
//             rows: 4,
//             rules: { required: true, max: 500 },
//         },

//     ]

//     const schema = customValidator(fields);
//     type FormValues = z.infer<typeof schema>;
//     const calculateTotals = (
//         items: typeof defaultValues.items,
//         tax: number,
//         discount: number
//     ) => {
//         const updatedItems = items.map((item) => ({
//             ...item,
//             total: item.quantity * item.unitPrice,
//         }))
//         const subtotal = updatedItems.reduce((acc, item) => acc + item.total, 0);
//         const newTotalAmount = +subtotal + +tax - +discount

//         setTotalAmount(newTotalAmount)
//         return updatedItems;
//     };


//     const handleItemChange = <K extends keyof InvoiceItem>(
//         index: number,
//         field: K,
//         value: InvoiceItem[K]
//     ) => {
//         const updatedItems = items.map((item, i) =>
//             i === index ? { ...item, [field]: value } : item
//         );
//         const updatedItemsWithTotal = calculateTotals(updatedItems, defaultValues.tax, defaultValues.discount);
//         setItems(updatedItemsWithTotal);
//     };


//     const addItem = () => {
//         setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
//     }
//     const removeItem = (index: number) => {
//         const updatedItems = items.filter((_, idx) => idx !== index);
//         setItems(updatedItems);
//         calculateTotals(updatedItems, defaultValues.tax, defaultValues.discount);
//     }
//     const onSubmit = async (values: FormValues) => {
//         try {
//             const data: any = { ...values, totalAmount };
//             const appointmentData = Appointments?.result.find((item: any) => data.appointmentId === item.patient?.name as string);
//             const invoiceData: any = {
//                 appointmentId: appointmentData?._id,
//                 issueDate: data.issueDate,
//                 dueDate: data.dueDate,
//                 paymentStatus: "Pending",
//                 paymentMethod: data.paymentMethod,
//                 tax: parseFloat(data.tax.toString()) || 0,
//                 discount: parseFloat(data.discount.toString()) || 0,
//                 totalAmount: data.totalAmount,
//                 notes: data.notes,
//                 items: updatedItem,
//             }
//             if (invoice && invoice._id) {
//                 if (navigator.onLine) {
//                     await updateInvoice({ updateId: invoice._id, updateData: invoiceData })
//                 } else {
//                     idbHelpers.update({ storeName: "invoices", endpoint: "invoice/update-invoice", _id: invoice._id, data: invoiceData })
//                 }
//             } else {
//                 if (navigator.onLine) {
//                     await addInvoice(invoiceData)
//                 } else {
//                     idbHelpers.add({ storeName: "invoices", endpoint: "invoice/add-invoice", data: invoiceData })
//                 }
//             }
//         } catch (error) {
//             console.error("Error adding invoice:", error)
//             toast.showSuccess("Failed to add invoice. Please try again.")
//         }
//     }

//     const { renderSingleInput, handleSubmit, setValue, watch, reset } = useDynamicForm({
//         schema,
//         fields,
//         onSubmit,
//         defaultValues,
//     });

//     const valueData = watch()
//     useEffect(() => {
//         if (valueData.tax || valueData.discount) {
//             setAmount({ tax: valueData.tax, discount: valueData.discount });
//             const updatedItems = calculateTotals(items, valueData.tax, valueData.discount);
//             setUpdatedItem(updatedItems);
//         }
//     }, [valueData.tax, valueData.discount, items])

//     const navigate = useNavigate()

//     useEffect(() => {
//         if (isAppointmentsFetchSuccess && Appointments) {
//             const appointments = Appointments?.result.map((item) => {
//                 return { label: item.patient?.name, value: item.patient?.name }
//             })
//             setAppointmentOptions([...appointmentOptions, ...appointments])
//         }
//     }, [isAppointmentsFetchSuccess, Appointments])


//     useEffect(() => {
//         if (id) {
//             if (invoices && navigator.onLine) {
//                 // setItems(invoices.items)
//                 setInvoice(invoices);
//             } else {
//                 const fetchData = async () => {
//                     const offlineData = await idbHelpers.get({ storeName: "invoices", _id: id });
//                     setInvoice(offlineData);
//                 };
//                 fetchData();
//             }
//         }
//     }, [id, invoices]);

//     useEffect(() => {
//         if (isSuccess) {
//             toast.showSuccess("Invoice Added successfully!")
//             navigate("/invoice")
//         } else if (isSuccessUpdate) {
//             toast.showSuccess("Invoice Updated successfully!")
//         }
//     }, [isSuccess, isSuccessUpdate])
//     useEffect(() => {
//         if (id && invoice) {
//             const appointments = Appointments?.result.find(item => item._id === invoice?.appointmentId?._id)
//             const appointmentId = appointments?.patient.name || ""
//             setValue("appointmentId", appointmentId)
//             const isoDate = invoice?.issueDate
//             const isoDueDate = invoice?.dueDate
//             const dateOnly = isoDate ? new Date(isoDate).toISOString().split("T")[0] : ""
//             const DueDate = isoDate ? new Date(isoDueDate).toISOString().split("T")[0] : ""
//             setValue("issueDate", dateOnly || "")
//             setValue("dueDate", DueDate || "")
//             setValue("paymentMethod", invoice?.paymentMethod || "")
//             setValue("tax", invoice?.tax.toString() || 0)
//             setValue("discount", invoice?.discount.toString() || 0)
//             setValue("notes", invoice?.notes || "")
//             console.warn(invoice.items)

//             setTimeout(() => {
//                 if (invoice?.items) {
//                     setItems(invoice.items);
//                 }
//             }, 0);
//             calculateTotals(invoice?.items || [], invoice?.tax || 0, invoice?.discount || 0)
//         }
//     }, [id, invoice, Appointments])




//     return <>
//         <div className="grid grid-cols-1 gap-x-8 gap-y-8">
//             <div className="flex justify-between">
//                 <h2 className="text-lg font-bold text-gray-900">{id ? "Update Invoice" : "Add Invoice"}</h2>
//                 <button
//                     type="button"
//                     className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//                     onClick={() => navigate("/invoice")}
//                 >
//                     Back
//                 </button>
//             </div>
//             <pre>{JSON.stringify(items, null, 2)}</pre>
//             <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
//                 <div className="px-4 py-6 sm:p-8">
//                     <h3 className="text-lg  font-semibold mb-4 text-gray-700">Invoice Items</h3>
//                     {items.map((item, index) => (
//                         <div key={index} className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12 my-5">
//                             <div className="sm:col-span-6 xl:col-span-3">
//                                 <label className="block text-sm/6 font-medium text-gray-900">Description</label>
//                                 <input
//                                     type="text"
//                                     defaultValue={item.description}
//                                     onChange={(e) => handleItemChange(index, "description", e.target.value)}
//                                     className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-3 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                                 />
//                             </div>
//                             <div className="sm:col-span-6 xl:col-span-3">
//                                 <label className="block text-sm/6 font-medium text-gray-900">Quantity</label>
//                                 <input
//                                     type="number"
//                                     defaultValue={item.quantity}
//                                     onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
//                                     className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                                 />
//                             </div>
//                             <div className="sm:col-span-6 xl:col-span-3">
//                                 <label className="block text-sm/6 font-medium text-gray-900">Unit Price</label>
//                                 <input
//                                     type="number"
//                                     defaultValue={item.unitPrice}
//                                     onChange={(e) => handleItemChange(index, "unitPrice", Number(e.target.value))}
//                                     className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                                 />
//                             </div>
//                             <div className="sm:col-span-6 xl:col-span-3">
//                                 <label className="block text-sm/6 font-medium text-gray-900">Total</label>
//                                 <input
//                                     type="number"
//                                     value={item.total}
//                                     readOnly
//                                     className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                                 />
//                                 <button
//                                     disabled={index === 0}
//                                     type="button"
//                                     onClick={() => removeItem(index)}
//                                     className={`mt-2 text-red-500 ${index === 0 ? "hidden" : "hover:underline"} `}
//                                 >
//                                     Remove Item
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                     <button
//                         type="button"
//                         onClick={addItem}
//                         className="w-full mt-5 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition duration-200"
//                     >
//                         Add New Item
//                     </button>
//                 </div>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
//                 <div className="px-4 py-6 sm:p-8">
//                     <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
//                         <div className="sm:col-span-3 xl:col-span-2">
//                             {/* {
//                                 Appointments.result.length != 0 && renderSingleInput("appointmentId")
//                             } */}
//                             {renderSingleInput("appointmentId")}
//                         </div>
//                         <div className="sm:col-span-3 xl:col-span-2">
//                             {renderSingleInput("issueDate")}
//                         </div>
//                         <div className="sm:col-span-3 xl:col-span-2">
//                             {renderSingleInput("dueDate")}
//                         </div>
//                         <div className="sm:col-span-3 xl:col-span-2">
//                             {renderSingleInput("paymentMethod")}
//                         </div>
//                         <div className="sm:col-span-3 xl:col-span-2">
//                             {renderSingleInput("tax")}
//                         </div>
//                         <div className="sm:col-span-3 xl:col-span-2">
//                             {renderSingleInput("discount")}
//                         </div>
//                         <div className="sm:col-span-3 xl:col-span-4">
//                             {renderSingleInput("notes")}
//                         </div>
//                     </div>

//                     <div className="bg-gray-100 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl mt-8" >
//                         <div className="px-4 py-6 sm:p-8">
//                             <h3 className="text-xl font-semibold text-gray-700">Invoice Summary</h3>
//                             <div className="mt-4 flex justify-between">
//                                 <span>Subtotal:</span>
//                                 <span>${items.reduce((acc, item) => acc + item.total, 0).toFixed(2)}</span>
//                             </div>
//                             <div className="mt-4 flex justify-between">
//                                 <span>Tax:</span>
//                                 <span>₹:{(amount.tax) ? amount.tax : "0"}.00</span>
//                             </div>
//                             <div className="mt-4 flex justify-between">
//                                 <span>Discount:</span>
//                                 <span>₹:{amount.discount ? amount.discount : "0"}.00</span>
//                             </div>
//                             <div className="mt-4 flex justify-between font-bold">
//                                 <span>Total Amount:</span>
//                                 <span>₹:{totalAmount}</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>



//                 <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
//                     <button onClick={() => {
//                         reset()
//                         setAmount({ tax: "", discount: "" })
//                     }} type="button" className="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//                     >
//                         Save
//                     </button>
//                 </div>
//             </form>
//         </div>

//     </>
// }

// export default AddInvoice














import React, { useEffect, useState } from "react";
import { z } from "zod";
import { FieldConfig } from "../../models/fieldConfig.interface";
import { IInvoice, useAddInvoiceMutation, useGetInvoiceByIdQuery, useUpdateInvoiceMutation } from "../../redux/apis/invoiceApi";
import { customValidator } from "../../utils/validator";
import useDynamicForm from "../../components/useDynamicForm";
import { IData, useGetAppointmentsQuery } from "../../redux/apis/appointment.api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "../../utils/toast";
import { idbHelpers } from "../../indexDB";

export interface Invoice {
    appointmentId?: IData;
    issueDate: string;
    dueDate: string;
    paymentStatus: string;
    paymentMethod: string;
    tax: number;
    discount: number;
    totalAmount: number;
    notes: string;
    items: InvoiceItem[];
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface updatedInvoice {
    total: number;
    description: string;
    quantity: number;
    unitPrice: number;
}
const defaultValues = {
    appointmentId: "",
    issueDate: "",
    dueDate: "",
    paymentMethod: "",
    tax: 0,
    discount: 0,
    totalAmount: 0,
    notes: "",
    items: [
        {
            description: "",
            quantity: 0,
            unitPrice: 0,
            total: 0,
        },
    ],
};

const AddInvoice: React.FC = () => {
    const [invoice, setInvoice] = useState<IInvoice | null>(null)
    const [addInvoice, { isSuccess }] = useAddInvoiceMutation()
    const [totalAmount, setTotalAmount] = useState<number>(0)
    const [appointmentOptions, setAppointmentOptions] = useState<{ label: string, value: string, disabled?: boolean }[]>([{
        label: "Select Appointment", value: "", disabled: true
    }])
    const [items, setItems] = useState(defaultValues.items)
    const { data: Appointments, isSuccess: isAppointmentsFetchSuccess } = useGetAppointmentsQuery({})
    const { id } = useParams()
    const [updatedItem, setUpdatedItem] = useState<updatedInvoice[]>()
    const [amount, setAmount] = useState({ tax: "", discount: "" })
    const [updateInvoice, { isSuccess: isSuccessUpdate, }] = useUpdateInvoiceMutation()
    const { data: invoices,
    } = useGetInvoiceByIdQuery(id || "", {
        skip: !id || !navigator.onLine
    })

    const fields: FieldConfig[] = [
        {
            name: "appointmentId",
            label: "Appointment ID",
            type: "select",
            rules: { required: true },
            options: appointmentOptions,
        },
        {
            name: "issueDate",
            label: "Issue Date",
            type: "date",
            rules: { required: true },
        },
        {
            name: "dueDate",
            label: "Due Date",
            type: "date",
            rules: { required: true },
        },
        {
            name: "paymentMethod",
            label: "Payment Method",
            type: "select",
            options: [
                { label: "Select Method", name: "Select Method", disabled: true },
                { name: "cash", label: "cash", value: "cash" },
                { name: "card", label: "card", value: "card" },
                { name: "online", label: "online", value: "online" },
            ],
            rules: { required: true },
        },
        {
            name: "tax",
            label: "Tax",
            type: "number",
            placeholder: "Enter Tax Amount or Percentage",
            rules: { required: true, min: 0 },
        },
        {
            name: "discount",
            label: "Discount",
            type: "number",
            placeholder: "Enter Discount or Percentage",
            rules: { required: true, min: 0 },
        },
        {
            name: "notes",
            label: "Notes",
            type: "textarea",
            placeholder: "Enter additional notes",
            rows: 4,
            rules: { required: true, max: 500 },
        },

    ]

    const schema = customValidator(fields);
    type FormValues = z.infer<typeof schema>;
    const calculateTotals = (
        items: typeof defaultValues.items,
        tax: number,
        discount: number
    ) => {
        const updatedItems = items.map((item) => ({
            ...item,
            total: item.quantity * item.unitPrice,
        }))
        const subtotal = updatedItems.reduce((acc, item) => acc + item.total, 0);
        const newTotalAmount = +subtotal + +tax - +discount

        setTotalAmount(newTotalAmount)
        return updatedItems;
    };


    const handleItemChange = <K extends keyof InvoiceItem>(
        index: number,
        field: K,
        value: InvoiceItem[K]
    ) => {
        const updatedItems = items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        const updatedItemsWithTotal = calculateTotals(updatedItems, defaultValues.tax, defaultValues.discount);
        setItems(updatedItemsWithTotal);
    };


    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    }
    const removeItem = (index: number) => {
        const updatedItems = items.filter((_, idx) => idx !== index);
        setItems(updatedItems);
        calculateTotals(updatedItems, defaultValues.tax, defaultValues.discount);
    }
    const onSubmit = async (values: FormValues) => {
        try {
            const data: any = { ...values, totalAmount };
            const appointmentData = Appointments?.result.find((item: any) => data.appointmentId === item.patient?.name as string);
            const invoiceData: any = {
                appointmentId: appointmentData?._id,
                issueDate: data.issueDate,
                dueDate: data.dueDate,
                paymentStatus: "Pending",
                paymentMethod: data.paymentMethod,
                tax: parseFloat(data.tax.toString()) || 0,
                discount: parseFloat(data.discount.toString()) || 0,
                totalAmount: data.totalAmount,
                notes: data.notes,
                items: updatedItem,
            }
            if (invoice && invoice._id) {
                if (navigator.onLine) {
                    await updateInvoice({ updateId: invoice._id, updateData: invoiceData })
                } else {
                    idbHelpers.update({ storeName: "invoices", endpoint: "invoice/update-invoice", _id: invoice._id, data: invoiceData })
                }
            } else {
                if (navigator.onLine) {
                    await addInvoice(invoiceData)
                } else {
                    idbHelpers.add({ storeName: "invoices", endpoint: "invoice/add-invoice", data: invoiceData })
                }
            }
        } catch (error) {
            console.error("Error adding invoice:", error)
            toast.showSuccess("Failed to add invoice. Please try again.")
        }
    }

    const { renderSingleInput, handleSubmit, setValue, watch, reset } = useDynamicForm({
        schema,
        fields,
        onSubmit,
        defaultValues,
    });

    const valueData = watch()
    useEffect(() => {
        if (valueData.tax || valueData.discount) {
            setAmount({ tax: valueData.tax, discount: valueData.discount });
            const updatedItems = calculateTotals(items, valueData.tax, valueData.discount);
            setUpdatedItem(updatedItems);
        }
    }, [valueData.tax, valueData.discount, items])

    const navigate = useNavigate()

    useEffect(() => {
        if (isAppointmentsFetchSuccess && Appointments) {
            const appointments = Appointments?.result.map((item) => {
                return { label: item.patient?.name, value: item.patient?.name }
            })
            setAppointmentOptions([...appointmentOptions, ...appointments])
        }
    }, [isAppointmentsFetchSuccess, Appointments])


    useEffect(() => {
        if (id) {
            if (invoices && navigator.onLine) {
                // setItems(invoices.items)
                setInvoice(invoices);
            } else {
                const fetchData = async () => {
                    const offlineData = await idbHelpers.get({ storeName: "invoices", _id: id });
                    setInvoice(offlineData);
                };
                fetchData();
            }
        }
    }, [id, invoices]);

    useEffect(() => {
        if (isSuccess) {
            toast.showSuccess("Invoice Added successfully!")
            navigate("/invoice")
        } else if (isSuccessUpdate) {
            toast.showSuccess("Invoice Updated successfully!")
        }
    }, [isSuccess, isSuccessUpdate])
    // useEffect(() => {
    //     if (id && invoice) {
    //         const appointments = Appointments?.result.find(item => item._id === invoice?.appointmentId?._id)
    //         const appointmentId = appointments?.patient.name || ""
    //         setValue("appointmentId", appointmentId)
    //         const isoDate = invoice?.issueDate
    //         const isoDueDate = invoice?.dueDate
    //         const dateOnly = isoDate ? new Date(isoDate).toISOString().split("T")[0] : ""
    //         const DueDate = isoDate ? new Date(isoDueDate).toISOString().split("T")[0] : ""
    //         setValue("issueDate", dateOnly || "")
    //         setValue("dueDate", DueDate || "")
    //         setValue("paymentMethod", invoice?.paymentMethod || "")
    //         setValue("tax", invoice?.tax.toString() || 0)
    //         setValue("discount", invoice?.discount.toString() || 0)
    //         setValue("notes", invoice?.notes || "")
    //         console.warn(invoice.items)

    //         setTimeout(() => {
    //             if (invoice?.items) {
    //                 // setItems(invoice.items);
    //                 const formattedItems = invoice.items.map(item => ({
    //                     description: item.description || "",
    //                     quantity: Number(item.quantity) || 0,
    //                     unitPrice: Number(item.unitPrice) || 0,
    //                     total: Number(item.total) || 0,
    //                 }));

    //                 setItems(formattedItems);
    //             }
    //         }, 500);
    //         calculateTotals(invoice?.items || [], invoice?.tax || 0, invoice?.discount || 0)
    //     }
    // }, [id, invoice, Appointments])


    useEffect(() => {
        if (id && invoice) {
            const appointments = Appointments?.result.find(item => item._id === invoice?.appointmentId?._id);
            const appointmentId = appointments?.patient.name || "";
            setValue("appointmentId", appointmentId);

            const isoDate = invoice?.issueDate;
            const isoDueDate = invoice?.dueDate;
            const dateOnly = isoDate ? new Date(isoDate).toISOString().split("T")[0] : "";
            const DueDate = isoDueDate ? new Date(isoDueDate).toISOString().split("T")[0] : "";

            setValue("issueDate", dateOnly || "");
            setValue("dueDate", DueDate || "");
            setValue("paymentMethod", invoice?.paymentMethod || "");
            setValue("tax", invoice?.tax?.toString() || "0");
            setValue("discount", invoice?.discount?.toString() || "0");
            setValue("notes", invoice?.notes || "");

            if (invoice?.items?.length) {
                const formattedItems = invoice.items.map(item => ({
                    description: item.description || "",
                    quantity: Number(item.quantity) || 0,
                    unitPrice: Number(item.unitPrice) || 0,
                    total: Number(item.total) || 0,
                }));
                setItems(formattedItems);
            }

            calculateTotals(invoice?.items || [], invoice?.tax || 0, invoice?.discount || 0);
        }
    }, [id, invoice, Appointments]);



    return <>
        <div className="grid grid-cols-1 gap-x-8 gap-y-8">
            <div className="flex justify-between">
                <h2 className="text-lg font-bold text-gray-900">{id ? "Update Invoice" : "Add Invoice"}</h2>
                <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    onClick={() => navigate("/invoice")}
                >
                    Back
                </button>
            </div>
            <pre>{JSON.stringify(items[0].unitPrice, null, 2)}</pre>
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                    <h3 className="text-lg  font-semibold mb-4 text-gray-700">Invoice Items</h3>
                    {items.map((item, index) => (
                        <div key={index} className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12 my-5">
                            <div className="sm:col-span-6 xl:col-span-3">
                                <label className="block text-sm/6 font-medium text-gray-900">Description</label>
                                <input
                                    type="text"
                                    defaultValue={item.description}
                                    value={item.description}
                                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-3 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                            <div className="sm:col-span-6 xl:col-span-3">
                                <label className="block text-sm/6 font-medium text-gray-900">Quantity</label>
                                <input
                                    type="number"
                                    defaultValue={item.quantity}
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                            <div className="sm:col-span-6 xl:col-span-3">
                                <label className="block text-sm/6 font-medium text-gray-900">Unit Price</label>
                                <input
                                    type="number"
                                    defaultValue={item.unitPrice}
                                    value={item.unitPrice}
                                    onChange={(e) => handleItemChange(index, "unitPrice", Number(e.target.value))}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                            <div className="sm:col-span-6 xl:col-span-3">
                                <label className="block text-sm/6 font-medium text-gray-900">Total</label>
                                <input
                                    type="number"
                                    value={item.total}
                                    readOnly
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                                <button
                                    disabled={index === 0}
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className={`mt-2 text-red-500 ${index === 0 ? "hidden" : "hover:underline"} `}
                                >
                                    Remove Item
                                </button>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addItem}
                        className="w-full mt-5 py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition duration-200"
                    >
                        Add New Item
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-3 xl:col-span-2">
                            {/* {
                                Appointments.result.length != 0 && renderSingleInput("appointmentId")
                            } */}
                            {renderSingleInput("appointmentId")}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("issueDate")}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("dueDate")}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("paymentMethod")}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("tax")}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-2">
                            {renderSingleInput("discount")}
                        </div>
                        <div className="sm:col-span-3 xl:col-span-4">
                            {renderSingleInput("notes")}
                        </div>
                    </div>

                    <div className="bg-gray-100 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl mt-8" >
                        <div className="px-4 py-6 sm:p-8">
                            <h3 className="text-xl font-semibold text-gray-700">Invoice Summary</h3>
                            <div className="mt-4 flex justify-between">
                                <span>Subtotal:</span>
                                <span>${items.reduce((acc, item) => acc + item.total, 0).toFixed(2)}</span>
                            </div>
                            <div className="mt-4 flex justify-between">
                                <span>Tax:</span>
                                <span>₹:{(amount.tax) ? amount.tax : "0"}.00</span>
                            </div>
                            <div className="mt-4 flex justify-between">
                                <span>Discount:</span>
                                <span>₹:{amount.discount ? amount.discount : "0"}.00</span>
                            </div>
                            <div className="mt-4 flex justify-between font-bold">
                                <span>Total Amount:</span>
                                <span>₹:{totalAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                    <button onClick={() => {
                        reset()
                        setAmount({ tax: "", discount: "" })
                    }} type="button" className="rounded-md bg-gray-400 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
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

export default AddInvoice


























