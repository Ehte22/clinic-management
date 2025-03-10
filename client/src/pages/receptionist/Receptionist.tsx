import React, { useEffect, useState } from "react";
import { useChangeReceptionistStatusMutation, useDeleteReceptionistMutation, useGetAllReceptionistsQuery } from "../../redux/apis/receptionistApi";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import TableData from "../../components/TableData";
import { format } from 'date-fns'
import { toast } from "../../utils/toast";
import Loader from "../../components/Loader";
import { idbHelpers } from "../../indexDB";
import { useDebounce } from "../../utils/useDebounce";
import ClinicSelector from "../../components/ClinicSelector";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";


const Receptionist: React.FC = () => {
    const [pagination, setPagination] = useState<{ pageIndex: number; pageSize: number }>({ pageIndex: 0, pageSize: 10 });
    const [sorting, setSorting] = useState<any[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [tableData, setTableData] = useState<any[]>([])
    const [deleteReceptionist, { isSuccess: isSuccessDelete, error: errorDelete, isError: isErrorDelete }] = useDeleteReceptionistMutation()
    const [changeStatus, { isSuccess, error, isError }] = useChangeReceptionistStatusMutation()
    const navigate = useNavigate()
    const debouncedSearchQuery = useDebounce(globalFilter, 500)
    const [selectedClinicId, setSelectedClinicId] = useState("")
    const { data, isLoading, isSuccess: isFetchSuccess } = useGetAllReceptionistsQuery({
        page: pagination.pageIndex + 1,
        // limit: 2,
        limit: pagination.pageSize,
        sortBy: JSON.stringify(sorting),
        filter: debouncedSearchQuery.toLowerCase(),
        selectedClinicId
    });
    const { user } = useSelector<RootState, any>(state => state.auth)

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "receptionists" });
        if (isFetchSuccess && navigator.onLine) {
            await idbHelpers.saveAll({ storeName: "receptionists", data: data.data });
            data && setTableData(data.data);
        } else if (!navigator.onLine) {
            setTableData(offlineData);
        }
    };

    const handleDelete = async (id: string) => {
        if (navigator.onLine) {
            deleteReceptionist(id)
        } else {
            idbHelpers.delete({ storeName: "receptionists", _id: id, endpoint: "receptionist/receptionists" })

            const offlineData = await idbHelpers.getAll({ storeName: "receptionists" });
            setTableData(offlineData)
        }
    }

    useEffect(() => {
        fetchData();
    }, [isSuccess, data]);



    const columns: ColumnDef<any>[] = [
        {
            header: "Name",
            accessorKey: "user.firstName",
            cell: (info) => {
                const row = info.row.original
                return `${row.user.firstName} ${row.user.lastName}`
            },
        },
        {
            header: "Email",
            accessorKey: "user.email",
            cell: (info) => info.getValue(),
        },
        {
            header: "Phone",
            accessorKey: "user.phone",
            cell: (info) => info.getValue(),
        },
        {
            header: "Working Hours",
            accessorKey: "working_hours",
            cell: (info) => {
                const value = info.getValue() as Array<{ day: string; from: string; to: string }>;
                return value.map((hour, index) => (
                    <div key={index}>
                        <p>
                            {format(new Date(hour.day), "dd-MM-yyyy")}
                            From: {hour.from} To: {hour.to}
                        </p>
                    </div>
                ));
            },
        },
        {
            header: "Status",
            accessorKey: "user.status",
            cell: (info) => {
                const row = info.row.original;
                const updateStatus = async () => {
                    const status = row?.user?.status === "active" ? "inactive" : "active"
                    if (navigator.onLine) {
                        await changeStatus({ id: row._id, status })
                    } else {
                        toast.showInfo("You are offline")
                    }
                }

                return (
                    <div className="flex gap-10">
                        <button
                            className={
                                row?.user?.status === "active"
                                    ? "inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                                    : "inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20"
                            }
                            onClick={updateStatus}
                        >
                            {row?.user?.status === "active" && "Active"}
                            {row?.user?.status === "inactive" && "Inactive"}
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
                            onClick={() => navigate(`/update-receptionist/${row._id}`)}
                        >
                            Edit
                        </button>
                        <button
                            className="text-red-600 hover:text-delete-900"
                            onClick={() => handleDelete(row._id)
                            }
                        >
                            Delete
                        </button>
                    </div>
                );
            },
        },
    ];

    const total = data?.total || 0
    useEffect(() => {
        if (error) {
            toast.showError(error as string)
        } else if (errorDelete) {
            toast.showError(errorDelete as string)
        }
    }, [isError, isErrorDelete])
    useEffect(() => {
        if (isSuccess) {
            toast.showSuccess("Receptionist status Changed!")
        }
    }, [isSuccess])
    useEffect(() => {
        if (isSuccessDelete) {
            toast.showSuccess("Receptionist SuccessFully Deleted!")
        }
    }, [isSuccessDelete])

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen -mt-20">
            <Loader size={16} />
        </div>
    }
    return (
        <div>

            <div className="grid grid-cols-1 sm:grid-cols-12  md:items-center">
                <div className="sm:col-span-3 xl:col-span-5">
                    <h2 className="text-lg font-bold text-gray-900">Receptionists</h2>
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
                                    onClick={() => navigate("/add-receptionist")}
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
                            totalRows={Math.ceil(total / pagination.pageSize)}
                            onPaginationChange={setPagination}
                            onSortingChange={setSorting}
                            onGlobalFilterChange={globalFilter}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Receptionist;
