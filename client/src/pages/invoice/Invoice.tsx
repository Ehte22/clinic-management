import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Invoice as IInvoice, useChangePaymentStatusMutation, useDeleteInvoiceMutation, useFetchAllInvoicesQuery } from "../../redux/apis/invoiceApi";
import { ColumnDef } from "@tanstack/react-table";
import TableData from "../../components/TableData";
import { toast } from "../../utils/toast";
import Loader from "../../components/Loader";
import { idbHelpers } from "../../indexDB";
import { useDebounce } from "../../utils/useDebounce";
import ClinicSelector from "../../components/ClinicSelector";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";


const Invoice: React.FC = () => {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<any>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [deleteInvoice, { error, isSuccess }] = useDeleteInvoiceMutation()
    const [tableData, setTableData] = useState<IInvoice[]>([])
    const navigate = useNavigate();
    const debouncedSearchQuery = useDebounce(globalFilter, 500)
    const [selectedClinicId, setSelectedClinicId] = useState("")
    const { user } = useSelector<RootState, any>(state => state.auth)
    const [ChangePayStatus,
        { isSuccess: isSuccessStatus, isError: isErrorStatus }] = useChangePaymentStatusMutation()
    const { data, isLoading, isSuccess: isFetchSuccess } = useFetchAllInvoicesQuery({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sortBy: JSON.stringify(sorting),
        filter: debouncedSearchQuery.toLowerCase(),
        selectedClinicId
    })

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "invoices" });
        if (isFetchSuccess && navigator.onLine) {
            await idbHelpers.saveAll({ storeName: "invoices", data: data?.data });

            data && setTableData(data.data);
        } else if (!navigator.onLine) {
            setTableData(offlineData);
        }
    };

    const handleDelete = async (id: string) => {
        if (navigator.onLine) {
            deleteInvoice(id)
        } else {
            idbHelpers.delete({ storeName: "invoices", _id: id, endpoint: "invoice/delete-invoice" })

            const offlineData = await idbHelpers.getAll({ storeName: "invoices" });
            setTableData(offlineData)
        }
    }

    const StatusChange = (arg: { _id: string, paymentStatus: any }) => {
        ChangePayStatus({ updateId: arg._id, Status: arg })
    }

    const columns: ColumnDef<any>[] = [
        {
            header: "Invoice Number",
            accessorKey: "invoiceNumber",
            cell: (info) => info.getValue(),
        },
        {
            header: "Issue Date",
            accessorKey: "issueDate",
            cell: (info) => {
                const value = info.getValue() as string;
                return new Date(value).toLocaleDateString();
            },
        },
        {
            header: "Due Date",
            accessorKey: "dueDate",
            cell: (info) => {
                const value = info.getValue() as string;
                return new Date(value).toLocaleDateString();
            },
        },
        {
            header: "Total Amount",
            accessorKey: "totalAmount",
            cell: (info) => `₹${info.getValue()}`,
        },
        {
            header: "Items",
            accessorKey: "items",
            cell: (info) =>
                (info.getValue() as Array<any>)
                    .map((item, index) => <div className="" key={index}>
                        <p>{item.description} ({item.quantity}x₹{item.unitPrice})</p>
                    </div>),
        },
        {
            header: "Payment Status",
            accessorKey: "user.status",
            cell: (info) => {
                const row = info.row.original
                const [status, setStatus] = useState(row.paymentStatus)
                const handleStatusChange = (event: string) => {
                    const newStatus = event
                    setStatus(newStatus)
                    StatusChange({ _id: row._id, paymentStatus: newStatus })
                };
                return (
                    <div className="flex gap-10">
                        <button
                            className={
                                status === "paid"
                                    ? "inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                                    : "inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20"
                            }
                            onClick={() => handleStatusChange(status === "unpaid" ? "paid" : "unpaid")}
                        >
                            {status}
                        </button>
                    </div>
                );
            }
        },
        {
            header: "Actions",
            cell: (info) => {
                const row = info.row.original
                const navigate = useNavigate()
                return (
                    <div className="flex gap-5">
                        <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => navigate(`/update-invoice/${row._id}`)}
                        >
                            Edit
                        </button>
                        <button
                            className="text-red-600 hover:text-delete-900"
                            onClick={() => handleDelete(row._id)}
                        >
                            Delete
                        </button>
                    </div>
                );
            },
        },
    ];

    useEffect(() => {
        fetchData();
    }, [isFetchSuccess, data]);


    useEffect(() => {
        if (isSuccess) {
            toast.showSuccess('Invoice Deleted!')
        }
    }, [isSuccess])
    useEffect(() => {
        if (isSuccessStatus) {
            toast.showSuccess("Payment status updated successfully!");
        }
    }, [isSuccessStatus]);

    useEffect(() => {
        if (isErrorStatus) {
            toast.showError(error as string || "Failed to update payment status!");
        }
    }, [isErrorStatus]);
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen -mt-20">
            <Loader size={16} />
        </div>
    }
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-12  md:items-center">
                <div className="sm:col-span-3 xl:col-span-5">
                    <h2 className="text-lg font-bold text-gray-900">Invoices</h2>
                </div>
                <div className="sm:col-span-9 xl:col-span-7">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-x-5">
                        <div className="sm:col-span-5 md:col-span-5 mt-4 sm:mt-0">
                            {
                                user && user.role === "Super Admin" && <div className="mb-5 md:mb-0">
                                    <ClinicSelector setSelected={setSelectedClinicId} />
                                </div>
                            }
                        </div>
                        <div className="sm:col-span-7 md:col-span-7">
                            <div className="flex items-center gap-5">
                                <input
                                    type="text"
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    placeholder="Search..."
                                    className="block w-full h-10 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                                <button
                                    type="button"
                                    className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    onClick={() => navigate("/add-invoice")}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">

                        <TableData
                            data={tableData}
                            columns={columns}
                            enableSorting={true}
                            enableGlobalFilter={true}
                            initialPagination={pagination}
                            totalRows={Math.ceil((data?.total || 1) / pagination.pageSize)}
                            onPaginationChange={setPagination}
                            onSortingChange={setSorting}
                            onGlobalFilterChange={globalFilter}
                            totalPages={Math.ceil((data?.total || 1) / pagination.pageSize)}
                        />

                    </div>
                </div>
            </div>
        </div >
    );
};

export default Invoice;
