import { useNavigate } from "react-router-dom"
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import TableData from "../../components/TableData";
import Loader from "../../components/Loader";
import { useDeleteSupplierMutation, useGetSuppliersQuery } from "../../redux/apis/supplier.api";
import { toast } from "../../utils/toast";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { idbHelpers } from "../../indexDB";
import { ISupplier } from "../../models/supplier.interface";
import { useDebounce } from "../../utils/useDebounce";
import ClinicSelector from "../../components/ClinicSelector";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const Suppliers = () => {

    // Hooks
    const [pagination, setPagination] = useState<{ pageIndex: number, pageSize: number }>({ pageIndex: 0, pageSize: 10 });
    const [searchQuery, setSearchQuery] = useState("");
    const [tableData, setTableData] = useState<ISupplier[]>([])
    const [selectedClinicId, setSelectedClinicId] = useState("")

    const navigate = useNavigate()
    const debouncedSearchQuery = useDebounce(searchQuery, 500)
    const { user } = useSelector<RootState, any>(state => state.auth)

    // Queries and Mutations
    const { data, isLoading, isSuccess } = useGetSuppliersQuery({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        searchQuery: debouncedSearchQuery.toLowerCase(),
        selectedClinicId
    })
    const [deleteSupplier, { data: deleteMessage, error: deleteError, isSuccess: isDeleteSuccess, isError: isDeleteError }] = useDeleteSupplierMutation()

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "suppliers" });
        if (isSuccess && navigator.onLine) {
            await idbHelpers.saveAll({ storeName: "suppliers", data: data.result });
            setTableData(data?.result);
        } else if (!navigator.onLine) {
            setTableData(offlineData);
        }
    };

    const handleDelete = async (id: string) => {
        if (navigator.onLine) {
            deleteSupplier(id)
        } else {
            idbHelpers.delete({ storeName: "suppliers", _id: id, endpoint: "supplier/delete-supplier" })

            const offlineData = await idbHelpers.getAll({ storeName: "suppliers" });
            setTableData(offlineData)
        }
    }

    useEffect(() => {
        fetchData();
    }, [isSuccess, data]);

    const columns: ColumnDef<any>[] = [
        {
            header: "Name",
            accessorKey: "name",
            cell: (info) => info.getValue(),
        },
        {
            header: "Phone Number",
            accessorKey: "phone",
            cell: (info) => info.getValue(),
        },
        {
            header: "Email",
            accessorKey: "email",
            cell: (info) => info.getValue(),
        },
        {
            header: "City",
            accessorKey: "address.city",
            cell: (info) => info.getValue(),
        },
        {
            header: "State",
            accessorKey: "address.state",
            cell: (info) => info.getValue(),
        },
        {
            header: "Actions",
            cell: (info) => {
                const row = info.row.original;
                const navigate = useNavigate()
                const [open, setOpen] = useState(false)

                useEffect(() => {
                    if (isDeleteSuccess) {
                        toast.showSuccess(deleteMessage)
                        setOpen(false)
                    }

                    if (isDeleteError) {
                        toast.showSuccess(deleteError as string)
                    }
                }, [deleteMessage, deleteError, isDeleteSuccess, isDeleteError])


                return <>
                    <div>
                        <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => navigate(`/update-supplier/${row._id}`)}
                        >
                            Edit
                        </button>
                        <button
                            className="text-red-600 hover:text-red-700 ms-5"
                            onClick={() => setOpen(true)}
                        >
                            Delete
                        </button>
                    </div>

                    <Dialog open={open} onClose={setOpen} className="relative z-10">
                        <DialogBackdrop
                            transition
                            className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                        />

                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <DialogPanel
                                    transition
                                    className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                                >
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                                            <ExclamationTriangleIcon aria-hidden="true" className="size-6 text-red-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                                                Delete Supplier
                                            </DialogTitle>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Are you sure you want to delete this supplier?
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(row._id)}
                                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            type="button"
                                            data-autofocus
                                            onClick={() => setOpen(false)}
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </DialogPanel>
                            </div>
                        </div>
                    </Dialog>
                </>
            },
        },
    ];


    if (isLoading) {
        return <div className="flex justify-center items-center h-screen -mt-20">
            <Loader size={16} />
        </div>
    }

    return <>

        <div>
            <div className="grid grid-cols-1 sm:grid-cols-12  md:items-center">
                <div className="sm:col-span-3 xl:col-span-5">
                    <h2 className="text-lg font-bold text-gray-900">Suppliers</h2>
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
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="block w-full h-10 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                                <button
                                    type="button"
                                    className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    onClick={() => navigate("/add-supplier")}
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
                            totalRows={data?.totalPages || 0}
                            onPaginationChange={setPagination}
                            onGlobalFilterChange={searchQuery}
                            totalPages={data?.totalPages}
                        />

                    </div>
                </div>
            </div>
        </div >
    </>
}

export default Suppliers