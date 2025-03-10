import { useNavigate } from "react-router-dom"
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useGetClinicsQuery } from "../../redux/apis/clinic.api";
import { useGetUsersQuery, useUpdateUserStatusMutation } from "../../redux/apis/user.api";
import { toast } from "../../utils/toast";
import TableData from "../../components/TableData";
import Loader from "../../components/Loader";
import { idbHelpers } from "../../indexDB";
import { IUser } from "../../models/user.interface";
import ClinicSelector from "../../components/ClinicSelector";
import { useDebounce } from "../../utils/useDebounce";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";

const Users = () => {
    // States
    const [pagination, setPagination] = useState<{ pageIndex: number, pageSize: number }>({ pageIndex: 0, pageSize: 10 });
    const [searchQuery, setSearchQuery] = useState("")
    const [tableData, setTableData] = useState<IUser[]>([])
    const [selectedClinicId, setSelectedClinicId] = useState("")

    // Hooks
    const navigate = useNavigate()
    const debouncedSearchQuery = useDebounce(searchQuery, 500)
    const { user } = useSelector<RootState, any>(state => state.auth)

    // Queries and Mutations
    const { data, isLoading, isSuccess } = useGetUsersQuery({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        searchQuery: debouncedSearchQuery.toLowerCase(),
        selectedClinicId
    })
    const [updateUserStatus, { data: statusMessage, error: statusError, isSuccess: isStatusSuccess, isError: isStatusError }] = useUpdateUserStatusMutation()

    const fetchData = async () => {
        const offlineData = await idbHelpers.getAll({ storeName: "users" });
        if (isSuccess && navigator.onLine) {
            await idbHelpers.saveAll({ storeName: "users", data: data.result });
            setTableData(data?.result);
        } else if (!navigator.onLine) {
            setTableData(offlineData);
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            header: "Full Name",
            accessorKey: "firstName",
            cell: (info) => {
                const row = info.row.original;
                return `${row.firstName} ${row.lastName}`;
            },
        },
        {
            header: "Email Address",
            accessorKey: "email",
            cell: (info) => info.getValue(),
        },
        {
            header: "Phone Number",
            accessorKey: "phone",
            cell: (info) => info.getValue(),
        },
        {
            header: "Clinic",
            accessorKey: "clinicId",
            cell: (info) => {
                const row = info.row.original
                const { data } = useGetClinicsQuery({ isFetchAll: true })

                const clinic = data?.result.find(item => item._id === row.clinicId)
                return clinic?.name
            },
        },
        {
            header: "Role",
            accessorKey: "role",
            cell: (info) => info.getValue(),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (info) => {
                const row = info.row.original

                const updateStatus = () => {
                    const status = row.status === "active" ? "inactive" : "active"
                    if (navigator.onLine) {
                        updateUserStatus({ status, id: row._id })
                    } else {
                        toast.showInfo("You are offline")
                    }
                }

                return (
                    <button
                        onClick={updateStatus}
                        className={
                            row.status === "active"
                                ? "inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                                : "inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20"
                        }
                    >
                        {row.status === "active" && "Active"}
                        {row.status === "inactive" && "Inactive"}
                    </button>
                );
            },
        },
        {
            header: "Actions",
            cell: (info) => {
                const row = info.row.original;
                const navigate = useNavigate()

                return (
                    <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => navigate(`/update-user/${row._id}`)}
                    >
                        Edit
                    </button>
                );
            },
        },
    ];

    useEffect(() => {
        fetchData();
    }, [isSuccess, data, selectedClinicId]);


    useEffect(() => {
        if (isStatusSuccess) {
            toast.showSuccess(statusMessage)
        }

        if (isStatusError) {
            toast.showError(statusError as string)
        }
    }, [statusMessage, statusError, isStatusSuccess, isStatusError])

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen -mt-20">
            <Loader size={16} />
        </div>
    }

    return <>
        <div>

            <div className="grid grid-cols-1 sm:grid-cols-12  md:items-center">
                <div className="sm:col-span-3 xl:col-span-5">
                    <h2 className="text-lg font-bold text-gray-900">Users</h2>
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
                                    onClick={() => navigate("/add-user")}
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

export default Users